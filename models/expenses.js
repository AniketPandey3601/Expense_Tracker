const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./index')

const Expense = sequelize.define('Expense', {
    amount: DataTypes.FLOAT,
    description: DataTypes.STRING,
    category: DataTypes.STRING,
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
 
  });

  module.exports = Expense;