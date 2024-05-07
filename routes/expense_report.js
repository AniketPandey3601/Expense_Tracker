

const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
const authenticateToken = require('../middleware/authenticateToken');
const express = require('express');
const router = express.Router();
const Users = require('../models/Users');
const Expense = require("../models/expenses");
const AWS = require('aws-sdk');
const S3File = require('../models/s3Files');
require('dotenv').config();
// AWS credentials and configuration
const accessKeyId = process.env.AWS_KEYID;
const secretAccessKey = process.env.AWS_SECRETKEY;
const region = process.env.AWS_REGION ;
const bucketName = process.env.AWS_BUCKETNAME;

AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region
});

const s3 = new AWS.S3();

router.use(authenticateToken);

// Define a new endpoint to handle the download expense report request
// const { createObjectCsvWriter } = require('csv-writer');

router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await Users.findByPk(userId);
        const isPremium = user.isPremium;

        // Check if the user is a premium user
        if (!isPremium) {
            return res.status(401).json({ error: 'Unauthorized. Only premium users can download reports.' });
        }

        // Query the database to get all expenses of the user
        const expenses = await Expense.findAll({ where: { userId: userId } });

        const currentDate = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
        const csvFileName = `expenses_${userId}-${currentDate}.csv`;

        // Create a CSV file with the expenses data
        const csvWriter = createObjectCsvWriter({
            path: csvFileName,
            header: [
                { id: 'amount', title: 'Amount' },
                { id: 'description', title: 'Description' },
                { id: 'category', title: 'Category' },
                { id: 'createdAt', title: 'Date' } // Assuming you have a createdAt field in your expenses schema
            ]
        });

        await csvWriter.writeRecords(expenses);

        // Read the content of the CSV file
        const fileContent = fs.readFileSync(csvFileName, 'utf8');


        const params = {
            Bucket: bucketName,
            Key: csvFileName,
            Body: fileContent, // Upload the content of the CSV file
            ContentType: 'text/csv'
        };

        const uploadedFile = await s3.upload(params).promise();

        const s3File = await S3File.create({ userId: userId, fileName: csvFileName, url: uploadedFile.Location });

        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${csvFileName}"`);

        // Send the CSV data as response
        res.send(fileContent);
    } catch (error) {
        console.error('Error generating expense report:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// Endpoint to fetch all the previous downloaded files by user
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