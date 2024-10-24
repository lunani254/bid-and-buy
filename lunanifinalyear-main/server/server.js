const express = require('express');
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello from server!');
});

// Payment method route
app.post('/payment-method', async (req, res) => {
  try {
    const { cardToken } = req.body;

    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: { token: cardToken },
    });

    res.json({ paymentMethodId: paymentMethod.id });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email sending route
app.post('/send-email', (req, res) => {
  const { email, bidPrice, status } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Your Bid Status: ${status}`,
    text: `Your bid of ksh ${bidPrice} has been ${status}.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent:', info.response);
      res.send('Email sent');
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
