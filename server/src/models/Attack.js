const { DataTypes } = require('sequelize');
const sequelize = require('../db/config');

const Attack = sequelize.define("Attack", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mojoCost: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  staminaCost: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Attack;