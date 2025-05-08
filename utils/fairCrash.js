const crypto = require('crypto');

function generateCrashPoint(seed, roundNumber) {
  const hash = crypto.createHash('sha256').update(seed + roundNumber).digest('hex');
  const h = parseInt(hash.slice(0, 8), 16);
  const maxCrash = 100;
  const crashPoint = (h % (maxCrash * 100)) / 100;
  return Math.max(1.01, crashPoint);
}

module.exports = generateCrashPoint;
