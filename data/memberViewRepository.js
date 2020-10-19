const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool({
    connectionLimit: 5,
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbDatabase
});

module.exports = {
    getByUserId: async function getByUserId(userId) {
        let [result] = await pool.query('SELECT * FROM memberView WHERE id = ?', userId);
        if (result.length === 0)
            return null;
        return result[0];
    },

    getByMemberId: async function getByMemberId(memberId) {
        let [result] = await pool.query('SELECT * FROM memberView WHERE memberId = ?', memberId);
        if (result.length === 0)
            return null;
        return result[0];
    },

    getAll: async function getAll() {
        let [results] = await pool.query('SELECT * FROM memberView');
        return results;
    },
};
