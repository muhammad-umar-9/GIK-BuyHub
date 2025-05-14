
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Your PostgreSQL database name
    password: 'Admin',         // Your PostgreSQL password
    port: 5432,             // Your PostgreSQL port
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    type: 'postgres',
};
