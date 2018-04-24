# Oracle

Given a [form of divination][divination-methods], consumes candles, does magic,
and outputs advice.

This is a tiny strategy runner that's API-compatible with strategies that will
leave you rekt.  But instead of running one monolithic server, you can have a
modular, polyglot architecture.

The oracle does not itself give advice; it merely relays your strategy's advice.

[divination-methods]: https://en.wikipedia.org/wiki/Methods_of_divination

### Installation

```shell
npm install
```

### Usage

Run the oracle server:

```shell
./bin/oracle --method examples/random.js --settings examples/random-settings.js
```

Once the oracle is running, publish candles to Redis on a `candle` channel, and
the oracle will execute your divination strategy and publish any advice to an
`advice` channel.  If you make a trade, publish that to a `trade` channel, and
the oracle will feed that back to your strategy.

### Notable Differences

- Does not support async indicators
