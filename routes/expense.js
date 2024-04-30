const express = require('express');
const router = express.Router();
const Expense  = require('../models/expenses');
const Users = require('../models/Users')
const authenticateToken = require('../middleware/authenticateToken')
const Sequelize = require('../models/index');


 
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
    try {
        const { amount, description, category } = req.body;
        const userId = req.user.userId
      
        const newExpense = await Expense.create({
            amount,
            description,
            category,
            userId
           
        });

        const user = await Users.findByPk(userId);
        user.totalExpense += parseInt(amount);
        await user.save();

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