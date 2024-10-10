// add your database connection here
const { Sequelize } = require('sequelize');


const db = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite')
})

module.exports = {
    db
}