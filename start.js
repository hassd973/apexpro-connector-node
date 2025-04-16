process.env.TZ = 'Europe/London';
const express = require('express');
const { HttpClient } = require('apexpro-connector-node');

const app = express();
const port = process.env.PORT || 10000;

async function fetchConfigs() {
  const client = new HttpClient('https://api.pro.apex.exchange');
  try {
    const configs = await client.getConfigs();
    console.log(`Fetched at ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}:`, configs);
    return configs;
  } catch (e) {
    console.error('Error:', e);
    return null;
  }
}

app.get('/', async (req, res) => {
  const configs = await fetchConfigs();
  res.json({
    message: 'ApexPro Connector Node.js SDK',
    timestamp: new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }),
    configs: configs || 'Error fetching configs'
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port} in ${process.env.TZ}`);
  fetchConfigs(); // Initial fetch on startup
});

setInterval(fetchConfigs, 60000); // Fetch every minute
