const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./index')


const PurchaseId = sequelize.define('PurchaseId', {
    purchaseId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

module.exports = PurchaseId;