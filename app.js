// app.js
import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 10000;

let cachedAccount = null;

// ✅ Validate env vars early
const requiredEnv = [
  'APEX_API_KEY',
  'APEX_PASSPHRASE',
  'APEX_SECRET',
  'APEX_L2KEY',
  'APEX_ETH_ADDRESS'
];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
});

// === AUTH HEADERS ===
function getAuthHeaders(body = '') {
  const timestamp = Date.now().toString();
  const preSign = timestamp + body;
  const signature = crypto
    .createHmac('sha256', process.env.APEX_SECRET)
    .update(preSign)
    .digest('hex');

  return {
    'APEX-API-KEY': process.env.APEX_API_KEY,
    'APEX-PASSPHRASE': process.env.APEX_PASSPHRASE,
    'APEX-SIGNATURE': signature,
    'APEX-TIMESTAMP': timestamp,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
}

// === GET ACCOUNT INFO ===
async function fetchAccountInfo() {
  try {
    const body = `l2Key=${process.env.APEX_L2KEY}&ethereumAddress=${process.env.APEX_ETH_ADDRESS}`;
    const res = await axios.post(
      'https://omni.apex.exchange/api/v3/onboarding',
      body,
      { headers: getAuthHeaders(body) }
    );

    const { account } = res.data;
    cachedAccount = account;

    console.clear();
    console.log('🧊 ICE KING BOT STATUS 👑');
    console.log(`👤 Account ID: ${account.id}`);
    console.log('💼 Spot Wallets:');
    account.spotWallets.forEach(w =>
      console.log(`  💰 ${w.tokenId}: ${w.balance}`)
    );

    console.log('\n📈 Positions:');
    account.positions.forEach(p =>
      console.log(`  📊 ${p.symbol} | ${p.side} | Size: ${p.size} | Entry: ${p.entryPrice}`)
    );
  } catch (err) {
    console.error('⚠️ Failed to fetch account info:', err.message);
  }
}

// === JSON API for frontend ===
app.get('/balance', (req, res) => {
  if (!cachedAccount) return res.status(503).json({ error: 'No account data yet.' });
  res.json({ balances: cachedAccount.spotWallets });
});

app.get('/positions', (req, res) => {
  if (!cachedAccount) return res.status(503).json({ error: 'No account data yet.' });
  res.json({ openPositions: cachedAccount.positions });
});

// === FRONTEND STATIC FILES ===
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  fetchAccountInfo();
  setInterval(fetchAccountInfo, 10000); // Every 10s
});
