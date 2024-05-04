const express = require('express');
const router = express.Router();
const Expense  = require('../models/expenses');
const Users = require('../models/Users')
const authenticateToken = require('../middleware/authenticateToken')
const sequelize = require('../models/index');


 
router.use(authenticateToken);


router.get('/user', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; 
        const user = await Users.findByPk(userId);
        const isPremium = user.isPremium;

        if (isPremium) {
            
            const leaderboardData = await Users.findAll({
                attributes: ['id', 'username', 'totalExpense'],
                order: [['totalExpense', 'DESC']]
            });

            res.json({ isPremium: true, leaderboard: leaderboardData });
        } else {
            res.json({ isPremium: false });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});


// router.get('/user', authenticateToken, async (req, res) => {
//     try {
//         const userId = req.user.userId; 
//         const user = await Users.findByPk(userId);
//         res.json({isPremium:user.isPremium});
//     } catch (error) {
//         console.log(error);
//         res.status(500).send(error.message);
//     }
// });


router.post('/', authenticateToken,async (req, res) => {

    let transaction;
    try {

       transaction = await sequelize.transaction()

        const { amount, description, category } = req.body;
        const userId = req.user.userId
      
        const newExpense = await Expense.create({
            amount,
            description,
            category,
            userId
           
        },{transaction});

        const user = await Users.findByPk(userId,{transaction});
        user.totalExpense += parseInt(amount);
        await user.save({transaction});

        await transaction.commit()

        res.json(newExpense);
    } catch (error) {

        console.log(error);
        if(transaction){
            await transaction.rollback();
        }
        res.status(500).send(error.message);
    }
});

router.get('', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming the user ID is extracted correctly by authenticateToken middleware
        const user = await Users.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const expensesPerPage = parseInt(req.query.limit) || 10;
        const currentPage = parseInt(req.query.page) || 1;

        const startIndex = (currentPage - 1) * expensesPerPage;

        // Query to get total number of expenses
        const total = await Expense.count({ where: { userId } });

        // Query to get expenses for the current page
        const expenses = await Expense.findAll({
            where: { userId },
            offset: startIndex,
            limit: expensesPerPage
        });

        res.json({
            expenses,
            total
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.delete('/:id', authenticateToken, async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        const userId = req.user.userId;
        const id = req.params.id;

        // Find the expense to be deleted
        const expenseToDelete = await Expense.findOne({ where: { id, userId }, transaction });

        if (!expenseToDelete) {
            // If expense not found, rollback transaction and send 404
            await transaction.rollback();
            return res.status(404).json({ message: "Expense not found" });
        }

        // Delete the expense
        await Expense.destroy({ where: { id, userId }, transaction });

        // Update totalExpense for the user
        const user = await Users.findByPk(userId, { transaction });
        user.totalExpense -= expenseToDelete.amount;
        await user.save({ transaction });

        // Commit the transaction
        await transaction.commit();

        res.status(204).send();
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
        res.status(500).send(error.message);
    }
});


module.exports = router;