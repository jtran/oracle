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
let path = require('path');

class BaseStrategy extends EventEmitter {

  // Instantiates a trading strategy.
  static create({ config, indicatorsDirectory, userStrategy, settings }) {

    let Strategy = class extends BaseStrategy {
      constructor() {
        super(...arguments);
      }
    }

    // Use all user-defined methods.
    for (let name in userStrategy) {
      Strategy.prototype[name] = userStrategy[name];
    }

    // Create the instance.
    let strategy = new Strategy({ indicatorsDirectory, config, settings });

    return strategy;
  }

  // Example config:
  //
  // config = {
  //   tradingAdvisor: {
  //     candleSize: 60,
  //     historySize: 10,
  //   },
  // };
  constructor({ indicatorsDirectory, config, settings }) {
    super();

    this.settings = settings;
    this.tradingAdvisor = config.tradingAdvisor;
    this.age = 0;
    this.processedTicks = 0;
    this.requiredHistory = 0;
    this.indicators = {};
    this.priceValue = 'close';
    this.setup = false;

    this._prevAdvice = undefined;

    // Cache of indicator classes.
    this._Indicators = {};
    this._indicatorsDirectory = indicatorsDirectory;

    // TODO: Set this to start time of the program.
    this._startTime = null;

    if (! this.log || ! config.debug) {
      this.log = function() {};
    }

    if (! this.update) {
      this.update = function() {};
    }

    if (! this.onTrade) {
      this.onTrade = function() {};
    }

    if (! this.end) {
      this.end = function() {};
    }

    this.init();

    this.setup = true;
  }

  addIndicator(name, indicatorType, settings) {
    if (this.setup) {
      throw new Error("You can't add an indicator after init()");
    }

    let IndicatorClass = this._Indicators[indicatorType];
    if (! IndicatorClass) {
      IndicatorClass = require(path.join(this._indicatorsDirectory, indicatorType));
      this._Indicators[indicatorType] = IndicatorClass;
    }
    let indicator = new IndicatorClass(settings);

    this.indicators[name] = indicator;

    return indicator;
  }

  addTalibIndicator(name, type) {
    throw new Error("Talib indicators are not supported; you tried to use: " + type);
  }

  addTulipIndicator(name, type) {
    throw new Error("Tulip indicators are not supported; you tried to use: " + type);
  }

  tick(candle) {
    this.age++;

    // Update indicators.
    let price = candle[this.priceValue];
    for (let name in this.indicators) {
      let indicator = this.indicators[name];
      let input = indicator.input;
      if (input === 'candle') {
        indicator.update(candle);
      }
      else if (input === 'price') {
        indicator.update(price);
      }
    }

    this.propagateTick(candle);
  }

  // @private
  propagateTick(candle) {
    this.candle = candle;
    this.update(candle);

    let shouldCheck = this.age >= this.requiredHistory;

    // TODO: Also condition on if we're running live.
    if (this._startTime) {
      let t = this._startTime.clone().subtract(this.tradingAdvisor.candleSize, 'minutes');
      shouldCheck = shouldCheck && candle.start >= t;
    }

    if (shouldCheck) {
      this.log(candle);
      this.check(candle);
    }

    this.processedTicks++;
  }

  advice(position, candle) {
    // Ignore "soft" advice or advice that's the same as previous advice.
    if (! position || position === this._prevAdvice) {
      return;
    }

    this._prevAdvice = position;

    this.emit('advice', {
      recommendation: position,
      portfolio: 1,
      candle: candle || this.candle,
    });
  }

  processTrade(trade) {
    this.onTrade(trade);
  }

  finish(cb) {
    this.end();
    return cb();
  }

}

module.exports = BaseStrategy;
