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
let EventEmitter = require('events');

// Given a Redis client, subscribes to candle channel and emits candle events.
class CandleListener extends EventEmitter {

  constructor(client) {
    super();

    this.client = client;

    client.on('error', (err) => {
      console.log("CandleListener client error: " + err);
    });

    client.on('message', (channel, payload) => {
      if (channel !== 'candle') {
        return;
      }

      let candle;
      try {
        candle = JSON.parse(payload);
      }
      catch (e) {
        console.error("Error parsing candle payload as JSON: " + payload);
      }
      if (candle !== undefined) {
        this.emit('candle', candle);
      }
    });
  }

  start() {
    this.client.subscribe('candle');
  }

}

module.exports = CandleListener;
