const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require('dotenv').config();
const Shopify = require('shopify-api-node');
const cors = require('cors');
const Sentry = require('@sentry/node');

Sentry.init({ dsn: process.env.SENTRY_DSN });

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

  // Customer ID must be an integer.
  const id = parseInt(req.body.customerId);

  // Metafields can't be set to an empy value so false is used when wishlist is empty.
  const products = req.body.products ? req.body.products : false;

  // Shopify REST API is capapble if creating and overwriting an existing metafield which saves a request. If using GraphQL you would need to first request the customer's metafields to get the ID of the wishlist metafield.
  shopify.metafield
  .create({
    key: 'wishlist',
    value: products,
    value_type: 'string',
    namespace: process.env.METAFIELD_NAMESPACE,
    owner_resource: 'customer',
    owner_id: id
  })
  .then(
    (metafield) => {
      console.log(metafield);
      return res.status(200).send({
        success: 'true',
        message: 'Customer wishlist successfully updated.'
      });
    },
    (err) => {
      console.error(err);
      // Capture error in Sentry if Shopify API rate limit is reached.
      Sentry.captureException(err);
      return res.status(429).send({
        success: 'false',
        message: err
      });
    }
  );
});

app.listen(port,() => {
  console.log(`Server running on port ${port}`)
});