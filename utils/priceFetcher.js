const axios = require('axios');
let cache = {};
let lastFetched = 0;

async function getPrice(symbol) {
  const now = Date.now();
  if (cache[symbol] && now - lastFetched < 10000) {
    return cache[symbol];
  }

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`;
  const res = await axios.get(url);
  const price = res.data[symbol].usd;
  cache[symbol] = price;
  lastFetched = now;
  return price;
}

module.exports = getPrice;
