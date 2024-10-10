const { DataTypes } = require('sequelize');
const sequelize = require('../db/config');

const Card = sequelize.define("Card", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mojo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stamina: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  imgUrl: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Card;