process.env.TZ = 'Europe/London';
const { HttpClient } = require('apexpro-connector-node');

async function main() {
  const client = new HttpClient('https://api.pro.apex.exchange');
  try {
    const configs = await client.getConfigs();
    console.log(`Fetched at ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}:`, configs);
  } catch (e) {
    console.error('Error:', e);
  }
}

main();
