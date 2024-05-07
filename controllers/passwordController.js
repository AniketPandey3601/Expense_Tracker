
const { v4: uuidv4 } = require('uuid');
const ForgotPasswordRequest = require('../models/forgotpasswordrequests');
const Users = require('../models/Users')
const Sib = require('sib-api-v3-sdk');

require('dotenv').config();


const defaultClient = Sib.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.API_KEY;



const senderEmail = process.env.SENDER_EMAIL;


exports.forgotpassword = async (req, res) => {
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
}

exports.passwordreset =  async (req, res) => {
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
            // res.send({ userId: forgotPasswordRequest.userId })
            res.redirect( '/resetpassword.html');
        } else {
            // Invalid or inactive UUID
            res.status(400).send('Invalid or expired reset password link.');
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).send('Internal server error.');
    }
}



exports.reset = async (req, res) => {
    try {
        const { userId, uuid, password } = req.body;

        // Update the user's password (assuming you have a User model)
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(400).send('User not found');
        }
        // Update the user's password
        user.password = password;
        await user.save();

        // Deactivate the reset password link
        const forgotPasswordRequest = await ForgotPasswordRequest.findOne({
            where: {
                userId: userId,
                uuid: uuid,
                isActive: true
            }
        });
        if (forgotPasswordRequest) {
            forgotPasswordRequest.isActive = false;
            await forgotPasswordRequest.save();
        } else {
            return res.status(400).send('Invalid reset password request');
        }

        res.status(200).send('Password reset successfully!');
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).send('Internal server error.');
    }
}