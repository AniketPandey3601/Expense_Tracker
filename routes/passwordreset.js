const express = require('express');
const router = express.Router();
const Sib = require('sib-api-v3-sdk');

// Initialize the SendinBlue API client
const defaultClient = Sib.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = 'api-key';
require ('dotenv').config()
// Define your SendinBlue sender email address
const senderEmail = 'sender-email';

router.post('/forgotpassword', async (req, res) => {
    try {
        const { email } = req.body;

        // Create the SendinBlue API instance
        const apiInstance = new Sib.TransactionalEmailsApi();

        // Define the email payload
        const sendSmtpEmail = {
            sender: { email: senderEmail },
            to: [{ email }],
            subject: 'Password Reset Request',
            htmlContent: '<p>Your password reset link: <a href="https://example.com/resetpassword">Reset Password</a></p>'
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

module.exports = router;
