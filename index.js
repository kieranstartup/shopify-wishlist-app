const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 8080;
const dotenv = require('dotenv').config();
const Shopify = require('shopify-api-node');
const cors = require('cors');

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
  console.info('REQUEST BODY',req.body);

  const id = parseInt(req.body.customerId);
  const products = req.body.products;

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
    (metafield) => console.log('SUCCESS',metafield),
    (err) => console.error(err)
  );

  if (id && products) {
    return res.status(200).send({
      success: 'true',
      message: 'Customer wishlist successfully updated.'
    });
  } else {
    return res.status(400).send({
      success: 'false',
      message: 'Missing param, failed to update customer wishlist.'
    });
  }
});

app.listen(port,() => {
  console.log(`Server running on port ${port}`)
});