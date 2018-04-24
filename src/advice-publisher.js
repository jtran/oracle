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

// Given a Redis client, publishes advice to the advice channel.  When a
// message is received from the trade channel, emits a trade event.
class AdvicePublisher extends EventEmitter {

  constructor(client) {
    super();

    this.client = client;

    client.on('error', (err) => {
      console.log("AdvicePublisher client error: " + err);
    });

    client.on('message', (channel, payload) => {
      if (channel !== 'trade') {
        return;
      }

      let trade;
      try {
        trade = JSON.parse(payload);
      }
      catch (e) {
        console.error("Error parsing trade payload as JSON: " + payload);
      }
      if (trade !== undefined) {
        this.emit('trade', trade);
      }
    });
  }

  start() {
    this.client.subscribe('trade');
  }

  processAdvice(advice) {
    this.client.publish('advice', JSON.stringify(advice));
  }

}

module.exports = AdvicePublisher;
