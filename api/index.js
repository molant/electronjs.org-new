//@ts-check
require('dotenv-safe').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const { addWebhooks } = require('./routes/webhook');

const start = async ()=>{
  await addWebhooks(app);

  app.get('/', (req, res) => {
    res.send(`There's nothing here!`);
  });

  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
};

start();
