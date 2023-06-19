const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const serverless = require('serverless-http');
const router = express.Router();

const Airtable = require('airtable-node');

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_ACCESS_TOKEN })
  .base(process.env.AIRTABLE_BASE)
  .table(process.env.AIRTABLE_TABLE);

require('dotenv').config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

router.get('/', (req, res) => {
  res.send('Server is running.. :)');
});

// Products routes
router.get('/products', async (req, res) => {
  try {
    const response = await airtable.list({ maxRecords: 200 });
    const products = response.records.map((product) => {
      const { id, fields } = product;
      const {
        name,
        featured,
        price,
        color,
        description,
        category,
        images,
        sex,
        size,
      } = fields;
      const { url } = images[0];
      return {
        id,
        name,
        featured,
        price,
        color,
        sex,
        description,
        category,
        size,
        image: url,
      };
    });
    res.status(200).json({
      products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/products/:id', async (req, res) => {
  const itemId = req.params.id;
  try {
    const product = await airtable.retrieve(itemId);
    //   product = { id: product.id, ...product.fields };
    if (itemId !== product.id) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Item not found',
      });
    }
    res.status(200).json({
      product: { id: product.id, ...product.fields },
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      error: err.message,
      message: 'server error',
    });
  }
});

app.use('/.netlify/functions/api', router);

module.exports = app;
module.exports.handler = serverless(app);

// server;
// const port = 3000;

// app.listen(port, () => {
//   console.log(`server run on port: ${port}`);
// });
