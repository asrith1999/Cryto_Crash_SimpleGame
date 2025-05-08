# Crypto Crash Game Backend

This project is a backend simulation of a real-time "Crash" betting game using cryptocurrency prices. Players place USD bets which are converted to crypto and try to cash out before the game crashes at a random multiplier.

---

## 🛠 Tech Stack

- **Node.js** with **Express.js**
- **MongoDB** for storing player data, transactions, and game history
- **Socket.IO** for real-time multiplayer updates
- **CoinGecko API** for real-time crypto prices

---

## 📦 Folder Structure

```
crypto-crash-backend/
│
├── models/              # Mongoose models (User, Transaction)
├── routes/              # API routes for bets, cashouts, balance
├── utils/               # Game logic, fair algorithm, price fetching
├── public/              # Static test client with WebSocket integration
├── server.js            # Main server entry point
└── .env                 # Environment variables (not included, create it manually)
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository & install dependencies

```bash
npm install
```

### 2. Create a `.env` file in the root directory:

```
MONGO_URI=mongodb://localhost:27017/crypto_crash
PORT=5000
```

### 3. Start the server

```bash
node server.js
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bet` | POST | Place a bet (USD to crypto) |
| `/api/cashout` | POST | Cash out before crash |
| `/api/balance/:userId` | GET | Get crypto balance (in crypto & USD) |

---

## 🔄 WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `roundStart` | server → client | `{ round, crashPoint }` |
| `multiplierUpdate` | server → client | `{ multiplier }` |
| `roundCrash` | server → client | `{ crashPoint }` |
| `cashout` | client → server | `{ userId }` |
| `cashoutResult` | server → client | payout info |
| `cashoutError` | server → client | error message |

---

## 🎲 Provably Fair Algorithm

The crash point is generated using:

```
SHA256(seed + roundNumber) % maxCrash
```

This ensures transparency and fairness. Seed and crash values are visible in logs.

---

## 💰 Crypto Conversion

Example:
- USD = $10
- BTC price = $60,000
- Bet = $10 / 60,000 = 0.00016667 BTC
- If cashed at 2x: 0.00016667 * 2 = 0.00033334 BTC
- Converted back to USD = $20

---

## 👨‍🔬 Test Users

Use MongoDB Compass or shell to insert sample users manually.

```js
db.users.insertOne({
  username: "testplayer",
  wallet: { BTC: 0.01, ETH: 0.5 }
})
```

---

## 🧪 Postman / API Test

Use the following payload to place a bet:

```json
POST /api/bet
{
  "userId": "USER_OBJECT_ID",
  "usdAmount": 10,
  "currency": "BTC"
}
```

---

## 🔗 Client Testing

Open `public/client.html` in your browser to see real-time updates and crashes.

---

## 🛡 Notes

- Uses mock crypto transactions (no blockchain interaction)
- Game round starts every 10 seconds
- Prices cached for 10 seconds to reduce API calls
- Provably fair crash generation with secure seed
