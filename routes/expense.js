const express = require('express');
const router = express.Router();
const Expense  = require('../models/expenses');
 

router.post('/', async (req, res) => {
    try {
        const { amount, description, category } = req.body;
      
        const newExpense = await Expense.create({
            amount,
            description,
            category
           
        });
        res.json(newExpense);
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});


router.get('/', async (req, res) => {
    try {
       
        const expenses = await Expense.findAll();
        res.json(expenses);
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});

module.exports = router;