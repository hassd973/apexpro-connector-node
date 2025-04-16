// app.js
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(express.json());

const API_URL = 'https://omni.apex.exchange/api/v3';
const {
  APEX_API_KEY,
  APEX_API_SECRET,
  APEX_PASSPHRASE,
  ETH_ADDRESS,
  L2_KEY
} = process.env;

const getTimestamp = () => Date.now().toString();

const signRequest = (method, endpoint, timestamp, body = '') => {
  const prehash = `${timestamp}${method}${endpoint}${body}`;
  return crypto
    .createHmac('sha256', APEX_API_SECRET)
    .update(prehash)
    .digest('hex');
};

const axiosPrivate = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const privateRequest = async (method, endpoint, body = {}) => {
  const timestamp = getTimestamp();
  const bodyString = method === 'GET' ? '' : JSON.stringify(body);
  const signature = signRequest(method, endpoint, timestamp, bodyString);

  const headers = {
    'APEX-API-KEY': APEX_API_KEY,
    'APEX-PASSPHRASE': APEX_PASSPHRASE,
    'APEX-TIMESTAMP': timestamp,
    'APEX-SIGNATURE': signature
  };

  return axiosPrivate({
    method,
    url: endpoint,
    data: body,
    headers
  });
};

// Health check
app.get('/', (req, res) => {
  res.send('Omni Trading Bot is running.');
});

// Account info
app.get('/account', async (req, res) => {
  try {
    const response = await privateRequest('GET', '/account');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Place new order
app.post('/order', async (req, res) => {
  try {
    const order = req.body;
    const response = await privateRequest('POST', '/order', order);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
app.post('/cancel', async (req, res) => {
  try {
    const { id } = req.body;
    const response = await privateRequest('POST', '/delete-order', { id });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get open orders
app.get('/orders', async (req, res) => {
  try {
    const response = await privateRequest('GET', '/open-orders');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Bot logic initiated...\nServer listening on port ${PORT}`);
});
