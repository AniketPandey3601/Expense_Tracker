const express = require('express');
const bodyParser = require('body-parser');
const signuproutes = require('./routes/signup');
const loginroutes = require('./routes/login')
const expensesroutes = require('./routes/expense')
const razorpayRoutes = require('./routes/razorpay')
const forgotpassRoutes = require('./routes/passwordreset')


require('dotenv').config();
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
const sequelize = require('./models/index');
const Users = require('./models/Users')
const Expense = require('./models/expenses');
const OrderId = require('./models/orderId');
const ForgotPasswordRequest = require('./models/forgotpasswordrequests')
const expensereportRoutes = require('./routes/expense_report')


Users.hasMany(Expense,{ foreignKey: 'userId' });
Expense.belongsTo(Users,{ foreignKey: 'userId' });

Users.hasMany(OrderId,{ foreignKey: 'userId' })
OrderId.belongsTo(Users,{ foreignKey: 'userId' });

Users.hasMany(ForgotPasswordRequest,{ foreignKey: 'userId' })
ForgotPasswordRequest.belongsTo(Users,{ foreignKey: 'userId' });

app.use('/signup',signuproutes);
app.use('/login' , loginroutes);
app.use('/expenses' , expensesroutes);
app.use('/razorpay', razorpayRoutes);
app.use('/password', forgotpassRoutes);
app.use('/expenses/report',expensereportRoutes)




sequelize.sync().then(() => {
    app.listen(3000, () => {
      console.log(`Server is running on port 3000`);
    });
  });