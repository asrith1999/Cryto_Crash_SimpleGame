const express = require('express');
const router = express.Router();
const { placeBet, cashOut, getBalance } = require('../utils/gameEngine');

router.post('/bet', placeBet);
router.post('/cashout', cashOut);
router.get('/balance/:userId', getBalance);

module.exports = router;
