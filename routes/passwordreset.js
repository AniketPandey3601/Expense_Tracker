const express = require('express');
const router = express.Router();
const Sib = require('sib-api-v3-sdk');
const { v4: uuidv4 } = require('uuid');
const ForgotPasswordRequest = require('../models/forgotpasswordrequests');
const Users = require('../models/Users')
require('dotenv').config();


// Initialize the SendinBlue API client
const defaultClient = Sib.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
// apiKey.apiKey = process.env.API_KEY;

apiKey.apiKey ='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'

// Define your SendinBlue sender email address
// const senderEmail = process.env.SENDER_EMAIL;

const senderEmail = 'yash8864919763@gmail.com'


router.post('/forgotpassword', async (req, res) => {
    try {
        const { email } = req.body;

        // Create the SendinBlue API instance
        const apiInstance = new Sib.TransactionalEmailsApi();

        // Generate a UUID for the reset password link
        const uuid = uuidv4();
        const user = await Users.findOne({ where: { email: email } });
        if (!user) {
            return res.status(400).send('User not found');
        }


        // Save the UUID in the database for later verification
        await ForgotPasswordRequest.create({
            userId: user.id,
            uuid: uuid,
            email: email,
            isActive: true
        });

        // Define the reset password URL with the generated UUID
        const resetPasswordURL = `http://localhost:3000/password/resetpassword/${uuid}`;

        // Define the email payload
        const sendSmtpEmail = {
            sender: { email: senderEmail },
            to: [{ email }],
            subject: 'Password Reset Request',
            htmlContent: `<p>Click <a href="${resetPasswordURL}">here</a> to reset your password.</p>`
        };

        // Send the email
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Password reset email sent:', response);

        res.status(200).send('Password reset email sent successfully!');
    } catch (error) {
        console.error('Error sending password reset email:', error);
        res.status(500).send('Failed to send password reset email.');
    }
});

router.get('/resetpassword/:uuid', async (req, res) => {
    try {
        const uuid = req.params.uuid;

        // Find the forgot password request by UUID
        const forgotPasswordRequest = await ForgotPasswordRequest.findOne({
            where: {
                uuid: uuid,
                isActive: true
            }
        });

        if (forgotPasswordRequest) {
            // Allow user to reset password
            res.render('reset-password-form', { userId: forgotPasswordRequest.userId });
        } else {
            // Invalid or inactive UUID
            res.status(400).send('Invalid or expired reset password link.');
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).send('Internal server error.');
    }
});

module.exports = router;