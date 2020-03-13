const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require('dotenv').config();
const Shopify = require('shopify-api-node');
const cors = require('cors');
const Sentry = require('@sentry/node');

Sentry.init({ dsn: 'https://7afc5783087d4758819f1faff7ef28d3@sentry.io/4617472' });

const shopify = new Shopify({
  shopName: process.env.SHOP_NAME,
  apiKey: process.env.API_KEY,
  password: process.env.PASSWORD
});

const corsOptions = {
  origin: ["https://puravidabracelets.com", /\.puravidabracelets\.com$/]
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.post('/',(req, res) => {

  const id = parseInt(req.body.customerId);
  const products = req.body.products ? req.body.products : false;

  shopify.metafield
  .create({
    key: 'wishlist',
    value: products,
    value_type: 'string',
    namespace: 'puravida',
    owner_resource: 'customer',
    owner_id: id
  })
  .then(
    (metafield) => {
      console.log(metafield);
      Sentry.captureMessage(`Customer ${id} updated their wishlist: "${products}".`);
      return res.status(200).send({
        success: 'true',
        message: 'Customer wishlist successfully updated.'
      });
    },
    (err) => {
      console.error(err);
      Sentry.captureException(err);
      return res.status(400).send({
        success: 'false',
        message: err
      });
    }
  );
});

app.listen(port,() => {
  console.log(`Server running on port ${port}`)
});