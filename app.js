const express = require('express');
const { ApexClient } = require('apexpro-connector-node');

const app = express();
const port = process.env.PORT || 3000;

// Dummy route to fulfill web service port binding
app.get('/', (req, res) => {
  res.send('ApexPro Connector Node is running.');
});

// Start your bot’s logic (adjust as needed)
(async () => {
  try {
    // For example, create an Omni client instance
    const client = ApexClient.createOmniClient();
    // Call some client methods (this is an example, adjust based on the API)
    // let result = await client.someMethod();
    console.log('Bot logic initiated...');
  } catch (error) {
    console.error('Error starting bot:', error);
  }
})();

// Listen on the designated port
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
