const mysql = require('mysql2/promise');
const config = require('../config');
const moment = require('moment-timezone');

const pool = mysql.createPool({
    connectionLimit: 5,
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbDatabase
});

module.exports = {
    add: async function add(form) {
        let sql = pool.format('INSERT INTO memberChangeForm SET ?', form);
        await pool.query(sql);
    },

    getByMemberId: async function getLast(memberId) {
        let [results] = await pool.query(
            'SELECT * FROM memberChangeForm WHERE id = ? ORDER BY createdTimestamp DESC', memberId);
        return results.map(r => mapToModel(r));
    },

    getLast: async function getLast(userId) {
        let [result] = await pool.query(
            'SELECT * FROM memberChangeForm WHERE userId = ? ORDER BY createdTimestamp DESC LIMIT 1', userId);
        if (result.length === 0)
            return null;
        return mapToModel(result[0]);
    },
};

function mapToModel(changeForm) {
    changeForm = {...changeForm};
    changeForm.createdTimestamp = moment(changeForm.createdTimestamp).utc(true);
    return changeForm;
}
