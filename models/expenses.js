const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./index')

const Expense = sequelize.define('Expense', {
    amount: DataTypes.FLOAT,
    description: DataTypes.STRING,
    category: DataTypes.STRING,
 
  });

  module.exports = Expense;