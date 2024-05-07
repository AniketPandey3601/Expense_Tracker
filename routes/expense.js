const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController')
const authenticateToken = require('../middleware/authenticateToken')



 
router.use(authenticateToken);


router.get('/user', authenticateToken, expenseController.getleaderboard);


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


router.post('/', authenticateToken,expenseController.postexpense);
router.get('', authenticateToken,expenseController.getexpenses)
router.delete('/:id', authenticateToken, expenseController.deleteexpense);


module.exports = router;