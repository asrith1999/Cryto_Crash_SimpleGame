const mongoose = require('mongoose');

const walletSchema = {
  BTC: { type: Number, default: 0 },
  ETH: { type: Number, default: 0 },
};

const userSchema = new mongoose.Schema({
  username: String,
  wallet: walletSchema,
});

module.exports = mongoose.model('User', userSchema);
