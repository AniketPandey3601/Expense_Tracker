const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./index')


const OrderId = sequelize.define('OrderId', {
    orderId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

module.exports = OrderId;