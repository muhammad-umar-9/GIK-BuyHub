
const DB_TYPE = process.env.DB_TYPE || 'postgres'; // Default to Postgres
let driver;

if (DB_TYPE === 'mongodb') {
    driver = require('./dbdrivers/mongodb');
} else {
    driver = require('./dbdrivers/postgres');
}

module.exports = driver;
