const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('expensetracker', 'root', 'An12Pa99@', {
  dialect: 'mysql',
  host: 'localhost',
});


module.exports = sequelize;