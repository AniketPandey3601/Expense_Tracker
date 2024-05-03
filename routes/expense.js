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

router.get('/count', async (req, res) => {
    const userId = req.user.id; // Assuming you have middleware to extract user information from JWT token

    try {
        // Use Sequelize to count the total number of expenses for the specified user
        const totalCount = await Expense.count({
            where: {
                userId: userId
            }
        });

        // Send the total count of expenses for the user as a JSON response
        res.json({ count: totalCount });
    } catch (error) {
        // If an error occurs, send an error response
        console.error('Error fetching total count of expenses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; 
        const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
        const expenses = await Expense.findAll({
            where: {
                userId: userId
            },
            offset: (page - 1) * limit,
            limit: limit
        });
        res.json({expenses});
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
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