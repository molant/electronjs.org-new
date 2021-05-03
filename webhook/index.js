//@ts-check
if (!process.env.CI) {
  require('dotenv-safe').config();
}

const express = require('express');
const bodyParser = require('body-parser');

const { addWebhooks } = require('./routes/webhook');

const start = async (port) => {
  return new Promise(async (resolve) => {
    const app = express();

    app.use(bodyParser.json());

    await addWebhooks(app);

    app.get('/', (req, res) => {
      res.send(`There's nothing here!`);
    });

    const server = app.listen(port, () => {
      console.log(`API listening on port ${port}`);
      server.port = port;
      resolve(server);
    });
  });
};

if (require.main === module) {
  const port = process.env.PORT || 3000;

  start(port);
}

module.exports = {
  start,
};
