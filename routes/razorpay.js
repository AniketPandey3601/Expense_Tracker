// routes/razorpay.js
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const OrderId = require('../models/orderId');
const PurchaseId = require('../models/purchaseId');
const authenticateToken = require('../middleware/authenticateToken');
const Users = require('../models/Users')
require('dotenv').config();

const razorpay = new Razorpay({
    key_id: process.env.RZP_KEY_ID,
    key_secret: process.env.RZP_KEY_SECRET
});

router.post('/create-order', authenticateToken, async (req, res) => {
    try {
        const orderOptions = {
            amount: 5000, 
            currency: 'INR',
            receipt: 'premium_subscription_' + req.user.userId,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(orderOptions);
        await OrderId.create({ orderId: order.id });
        res.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).send(error.message);
    }
});

router.post('/payment-success', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.body;
        // Save purchase id in database
        await PurchaseId.create({ purchaseId: orderId });
        // Update user's premium status in the database
        // Example: Update user's premium status to true
        // const userId = req.user.userId;
        // const user = await User.findById(userId);
        // user.isPremium = true;
        // await user.save();
        await Users.update({ isPremium: true }, { where: { id: req.user.userId } });
        res.json({ message: 'Payment successful! You are now a premium member.' });
    } catch (error) {
        console.error('Error handling payment success:', error);
        res.status(500).send(error.message);
    }
});

router.post('/payment-failure', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.body;
        // Log the payment failure
        console.error('Payment failed for orderId:', orderId);
        // Update order status to failed in the database
        // Example: Update order status to failed
        // await OrderId.destroy({ where: { orderId } });
        // await PurchaseId.destroy({ where: { purchaseId: orderId } });
        res.status(400).json({ message: 'Transaction failed. Please try again later.' });
    } catch (error) {
        console.error('Error handling payment failure:', error);
        res.status(500).send(error.message);
    }
});

module.exports = router;