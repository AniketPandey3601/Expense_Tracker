const express = require('express');
const router = express.Router();
const Expense  = require('../models/expenses');
const authenticateToken = require('../middleware/authenticateToken')
 
router.use(authenticateToken);

router.post('/', authenticateToken,async (req, res) => {
    try {
        const { amount, description, category } = req.body;
        const userId = req.user.userId
      
        const newExpense = await Expense.create({
            amount,
            description,
            category,
            userId
           
        });
        res.json(newExpense);
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});


router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; 
        const expenses = await Expense.findAll(
            {
                where:{userId:userId}
            }
        );
        res.json(expenses);
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});

router.delete('/:id', authenticateToken,async (req, res) => {
    try {
        const userId = req.user.userId; 
        const id = req.params.id;
        const result = await Expense.destroy({
            where: {userId:userId}&&{ id: id }
        });
        if (result === 1) {
            res.status(204).send();  
        } else {
            res.status(404).send({ message: "Expense not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});

module.exports = router;