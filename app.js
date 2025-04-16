import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const BASE_URL = 'https://omni.apex.exchange/api/v3';
const PORT = process.env.PORT || 10000;

const headers = (timestamp, signature) => ({
  'APEX-TIMESTAMP': timestamp,
  'APEX-SIGNATURE': signature,
  'APEX-API-KEY': process.env.APEX_API_KEY,
  'APEX-PASSPHRASE': process.env.APEX_PASSPHRASE
});

const signPayload = (payload) => {
  return crypto
    .createHmac('sha256', process.env.APEX_API_SECRET)
    .update(payload)
    .digest('hex');
};

// 🧠 Utility
const now = () => Date.now().toString();

// 🧾 Place Order
async function placeOrder(data) {
  const timestamp = now();
  const query = new URLSearchParams(data).toString();
  const signature = signPayload(`${timestamp}${query}`);

  const res = await axios.post(`${BASE_URL}/order`, query, {
    headers: headers(timestamp, signature),
  });
  return res.data;
}

// ❌ Cancel Order by ID
async function cancelOrder(id) {
  const timestamp = now();
  const signature = signPayload(`${timestamp}id=${id}`);

  const res = await axios.post(`${BASE_URL}/delete-order`, `id=${id}`, {
    headers: headers(timestamp, signature),
  });
  return res.data;
}

// 🔍 Get Open Orders
async function getOpenOrders() {
  const timestamp = now();
  const signature = signPayload(timestamp);

  const res = await axios.get(`${BASE_URL}/open-orders`, {
    headers: headers(timestamp, signature),
  });
  return res.data;
}

// 📈 Account Info
async function getAccount() {
  const timestamp = now();
  const signature = signPayload(timestamp);

  const res = await axios.get(`${BASE_URL}/account`, {
    headers: headers(timestamp, signature),
  });
  return res.data;
}

// 💹 Historical PnL
async function getPnLHistory() {
  const timestamp = now();
  const signature = signPayload(timestamp);

  const res = await axios.get(`${BASE_URL}/historical-pnl`, {
    headers: headers(timestamp, signature),
  });
  return res.data;
}

// 🛠 INIT Bot on Start
async function init() {
  console.log("📊 Booting Omni Trading Bot...");

  try {
    const account = await getAccount();
    console.log("🧾 Account:", account);

    const orders = await getOpenOrders();
    console.log("📋 Open Orders:", orders);

    const pnl = await getPnLHistory();
    console.log("💰 PnL History:", pnl);

    // Optional: Place a sample order
    // const order = await placeOrder({
    //   symbol: 'BTC-USDT',
    //   side: 'BUY',
    //   type: 'LIMIT',
    //   size: '0.01',
    //   price: '30000',
    //   limitFee: '1',
    //   expiration: `${Date.now() + 60000}`,
    //   timeInForce: 'GOOD_TIL_CANCEL',
    //   clientOrderId: crypto.randomUUID(),
    //   signature: 'your-zk-signature'
    // });
    // console.log("🚀 Placed Order:", order);

  } catch (err) {
    console.error("❌ Bot Error:", err.response?.data || err.message);
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  init(); // Start bot logic on deploy
});
