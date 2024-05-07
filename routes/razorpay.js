// routes/razorpay.js
const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken');
const razorpayController = require('../controllers/razorpayController')
require('dotenv').config();



router.post('/create-order', authenticateToken,razorpayController.createOrder);

router.post('/payment-success', authenticateToken,razorpayController.paymentSuccess );

router.post('/payment-failure', authenticateToken, razorpayController.paymentFailure);

module.exports = router;