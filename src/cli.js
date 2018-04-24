// Copyright (C) 2018 Jonathan Tran
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
let path = require('path');
let redis = require('redis');
let program = require('commander');

let Server = require('./server');

let run = function(args) {
  args = args || process.argv;

  program
    .version('1.0.0')
    .option('-H, --host [HOST]', 'Redis host', '127.0.0.1')
    .option('-p, --port [PORT]', 'Redis port', 6379)
    .option('-m, --method [METHOD]', 'Path to divination method .js file')
    .option('-c, --config [CONFIG]', 'Path to config .js file')
    .option('-s, --settings [SETTINGS]', 'Path to strategy settings .js file; overrides config if given')
    .option('-I, --indicators [DIR]', 'Path to indicators directory')
    .parse(args);

  if (! program.method) {
    console.error("Divination method required; use the --method option");
    return null;
  }

  // Create Redis client.
  let redisClient = redis.createClient({
    host: program.host,
    port: program.port,
  });

  // Load config.
  let config = program.config ? require(path.resolve(program.config)) : {};

  // Load strategy settings.
  let strategySettings = program.settings
                         ? require(path.resolve(program.settings))
                         : config[config.tradingAdvisor.method];

  let server = new Server({
    pathToStrategy: path.resolve(program.method),
    indicatorsDirectory: path.resolve(program.indicators || '../'),
    config,
    strategySettings,
    redisClient,
  });

  // Note: this will probably never get called since we're usually killed by a
  // signal.
  process.on('beforeExit', (code) => {
    // Shut down server.
    server.finish();
    // Clean up client connections.
    redisClient.quit();
  });

  server.run();

  return server;
}

module.exports = run;
