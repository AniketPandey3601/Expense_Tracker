const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const createObjectCsvWriter = require('csv-writer').csvWriter;
const authenticateToken = require('../middleware/authenticateToken');
const express = require('express');
const router = express.Router();
const Users = require('../models/Users')
const Expense = require("../models/expenses")
const AWS = require('aws-sdk');
const S3File= require('../models/s3Files')

const s3 = new AWS.S3();

router.use(authenticateToken);

// Define a new endpoint to handle the download expense report request
router.get('', async (req, res) => {
    try {

        const userId = req.user.userId; 
        const user = await Users.findByPk(userId);
        const isPremium = user.isPremium;

        console.log(isPremium)
        // Check if the user is a premium user
        if ( !isPremium) {
            return res.status(401).json({ error: 'Unauthorized. Only premium users can download reports.' });
        }

        // Query the database to get all expenses of the user
        const expenses = await Expense.findAll({ userId: req.user.id });


        const currentDate = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
        const csvFileName = `expenses_${userId}-${currentDate}.csv`;


        // Create a CSV file with the expenses data
        const filePath = path.join(__dirname, csvFileName);
        const csvWriter = createCsvWriter({
            path: filePath,
            header: [
                { id: 'amount', title: 'Amount' },
                { id: 'description', title: 'Description' },
                { id: 'category', title: 'Category' },
                { id: 'createdAt', title: 'Date' } // Assuming you have a createdAt field in your expenses schema
            ]
        });

        await csvWriter.writeRecords(expenses);

        const params = {
            Bucket: 'your-bucket-name',
            Key: csvFileName,
            Body: fs.createReadStream(filePath)
        };

        const uploadedFile = await s3.upload(params).promise();

        const s3File = await S3File.create({ userId: userId, fileName: csvFileName, url: uploadedFile.Location });

        // Send the S3 file URL to the client
        res.json({  url: s3File.url });

        // Once the CSV file is created, send it to the client
        // res.sendFile(filePath, (err) => {
        //     if (err) {
        //         console.error('Error sending file:', err);
        //         return res.status(500).json({ error: 'Internal server error.' });
        //     }
        //     // Cleanup: Delete the file after sending
        //     fs.unlink(filePath, (err) => {
        //         if (err) {
        //             console.error('Error deleting file:', err);
        //         }
        //     });
        // });
    } catch (error) {
        console.error('Error generating expense report:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});


router.get('/s3files', async (req, res) => {
    try {
        const userId = req.user.userId;
        const files = await S3File.findAll({ where: { userId: userId } });

        const fileUrls = files.map(file => file.url);
        res.json({ files: fileUrls }); // Send the list of S3 file URLs to the client
    } catch (error) {
        console.error('Error fetching S3 files:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;

module.exports = router;