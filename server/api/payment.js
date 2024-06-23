const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const stripe = Stripe('sk_test_51PSCEFJibWimjq7AXY6PnVDS1xDSVRcsQramWRznJoK3R03ZOHM3wvRT7FuzCvQPL0AcQy6DL58YU3yWuFqCi7S700SHpGzb5b');

app.use(cors());
app.use(bodyParser.json());

app.post('/api/payment/create-payment-intent', async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'sgd',
      payment_method_types: ['card'],
    });
    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    res.status(400).json({
      error: {
        message: e.message,
      },
    });
  }
});

module.exports = app;

