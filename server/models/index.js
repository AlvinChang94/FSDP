'use strict';
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const db = {};
require('dotenv').config();
// Create sequelize instance using config
let sequelize = new Sequelize({
    //dialect: 'sqlite',
    //storage: process.env.DB_FILE //checks the .env file for where the sqlite file is
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    dialect: 'mysql',
    logging: false,
    timezone: '+08:00'
});
fs
    .readdirSync(__dirname) //reads the directory for all files
    .filter(file => { //filters all files in the directory for .js files and imports them as Squelize models
        return (file.indexOf('.') !== 0) && (file !== basename) &&
            (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize,
            Sequelize.DataTypes); // load each model definition in the current directory
        db[model.name] = model;
    });
Object.keys(db).forEach(modelName => { //checks if there are any associate methods, and calls a method to define the association. This is only used for initialising the database
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;