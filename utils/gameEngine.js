const User = require('../models/User');
const Transaction = require('../models/Transaction');
const getPrice = require('./priceFetcher');
const generateCrashPoint = require('./fairCrash');
const crypto = require('crypto');

let round = 0;
let players = {};
let crashPoint = 0;
let currentMultiplier = 1;
let interval;

async function placeBet(req, res) {
  const { userId, usdAmount, currency } = req.body;
  const user = await User.findById(userId);
  const price = await getPrice(currency.toLowerCase());
  const cryptoAmount = usdAmount / price;

  if (!user || user.wallet[currency] < cryptoAmount) {
    return res.status(400).send('Insufficient balance');
  }

  user.wallet[currency] -= cryptoAmount;
  await user.save();

  players[userId] = { usdAmount, cryptoAmount, currency, cashedOut: false };

  await Transaction.create({
    playerId: userId,
    usdAmount,
    cryptoAmount,
    currency,
    transactionType: 'bet',
    transactionHash: crypto.randomUUID(),
    priceAtTime: price
  });

  res.send({ message: 'Bet placed successfully' });
}

async function cashOut(req, res) {
  const { userId } = req.body;
  const player = players[userId];

  if (!player || player.cashedOut || currentMultiplier >= crashPoint) {
    return res.status(400).send('Cannot cash out');
  }

  const payoutCrypto = player.cryptoAmount * currentMultiplier;
  const user = await User.findById(userId);
  user.wallet[player.currency] += payoutCrypto;
  await user.save();

  player.cashedOut = true;

  await Transaction.create({
    playerId: userId,
    usdAmount: payoutCrypto * (await getPrice(player.currency.toLowerCase())),
    cryptoAmount: payoutCrypto,
    currency: player.currency,
    transactionType: 'cashout',
    transactionHash: crypto.randomUUID(),
    priceAtTime: await getPrice(player.currency.toLowerCase())
  });

  res.send({ message: 'Cashed out successfully' });
}

async function getBalance(req, res) {
  const user = await User.findById(req.params.userId);
  const btcPrice = await getPrice('bitcoin');
  const ethPrice = await getPrice('ethereum');
  res.send({
    BTC: { amount: user.wallet.BTC, usd: user.wallet.BTC * btcPrice },
    ETH: { amount: user.wallet.ETH, usd: user.wallet.ETH * ethPrice }
  });
}

function gameLoop(io) {
  setInterval(async () => {
    round++;
    crashPoint = generateCrashPoint('secure-seed', round);
    currentMultiplier = 1;
    players = {};
    io.emit('roundStart', { round, crashPoint });

    interval = setInterval(() => {
      currentMultiplier += 0.01;
      io.emit('multiplierUpdate', { multiplier: currentMultiplier.toFixed(2) });

      if (currentMultiplier >= crashPoint) {
        clearInterval(interval);
        io.emit('roundCrash', { crashPoint });
      }
    }, 100);
  }, 10000);
}

module.exports = (io) => {
  io.on('connection', socket => {
    socket.on('cashout', async ({ userId }) => {
      const fakeReq = { body: { userId } };
      const fakeRes = { send: msg => socket.emit('cashoutResult', msg), status: () => ({ send: msg => socket.emit('cashoutError', msg) }) };
      await cashOut(fakeReq, fakeRes);
    });
  });

  gameLoop(io);
};

module.exports.placeBet = placeBet;
module.exports.cashOut = cashOut;
module.exports.getBalance = getBalance;
