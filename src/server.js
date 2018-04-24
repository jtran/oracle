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
let BaseStrategy = require('./base-strategy');
let CandleListener = require('./candle-listener');
let AdvicePublisher = require('./advice-publisher');

class Server {

  constructor({ config,
                pathToStrategy,
                indicatorsDirectory,
                strategySettings,
                redisClient,
              }) {
    // TODO: query candles from history start time till now and stitch together.

    let candleListener = new CandleListener(redisClient);
    this.candleListener = candleListener;

    candleListener.on('candle', (candle) => {
      // Send candle to the strategy.
      this.strategy.tick(candle);
    });

    // Require your custom strategy.
    let rawStrategy = require(pathToStrategy);

    // Instantiate the strategy.
    let strategy = BaseStrategy.create({
      config,
      indicatorsDirectory,
      userStrategy: rawStrategy,
      settings: strategySettings,
    });
    this.strategy = strategy;

    strategy.on('advice', (advice) => {
      // Send advice to the trader.
      this.advicePublisher.processAdvice(advice);
    });

    let advicePublisher = new AdvicePublisher(redisClient);
    this.advicePublisher = advicePublisher;

    advicePublisher.on('trade', (trade) => {
      // When we actually trade, let the strategy know.
      strategy.processTrade(trade);
    });
  }

  run() {
    this.advicePublisher.start();
    this.candleListener.start();
  }

  finish() {
    // Let the strategy clean up.
    this.strategy.finish(() => {
      console.log("Finished");
    });
  }

}

module.exports = Server;
