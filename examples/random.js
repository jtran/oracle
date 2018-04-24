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
let strat = {};

strat.init = function() {
  console.log('init');
  this.long = this.settings.long;
  this.short = this.settings.short;
};

strat.update = function(candle) {
  console.log('update', candle);
};

strat.log = function(candle) {
  console.log('log', candle);
};

strat.check = function(candle) {
  console.log('check', candle);

  let x = Math.random();
  if (x > this.long) {
    this.advice('long');
  }
  else if (x < this.short) {
    this.advice('short');
  }
};

strat.onTrade = function(trade) {
  console.log('onTrade', trade);
};

module.exports = strat;
