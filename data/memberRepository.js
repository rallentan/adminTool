const mysql = require('mysql2/promise');
const config = require('../config');
const moment = require('moment-timezone');
const Member = require('../model/member');

const pool = mysql.createPool({
    connectionLimit: 5,
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbDatabase
});

module.exports = {
    add: async function add(member) {
        member = mapToMySQL(member);
        let sql = pool.format('INSERT INTO `member` SET ?', member);
        await pool.query(sql);
    },

    addOrUpdate: async function addOrUpdate(member) {
        member = mapToMySQL(member);
        let columns = Object.keys(member);
        let values = Object.values(member);
        let sqlStatement = pool.format('INSERT INTO `member` (??) VALUES ', [columns]);
        let sqlValues = pool.format('(?)', [values]);
        let sqlUpdate = '\nON DUPLICATE KEY UPDATE\n';
        let sqlUpdateValues = columns.reduce((acc, column) => {
            let assignment = pool.format(`    ?? = VALUES(??)`, [column, column]);
            if (acc)
                return acc + ',\n' + assignment;
            else
                return assignment;
        }, '');
        let sql = sqlStatement + sqlValues + sqlUpdate + sqlUpdateValues;
        let [results] = await pool.query(sql);
        return results;
    },

    update: async function update(member) {
        member = mapToMySQL(member);
        let sql = pool.format(`UPDATE \`member\` SET ${prepare(member)} WHERE id = ?`, member.id);
        let [results] = await pool.query(sql);
        return results;
    },

    get: async function get(memberId) {
        let sql = pool.format('SELECT * FROM `member` WHERE id = ?', memberId);
        let [results] = await pool.query(sql);
        if (results.length === 0)
            return null;
        let member = results[0];
        Object.setPrototypeOf(member, Member);
        return member;
    }
};

function prepare(object) {
    let columns = Object.keys(object);
    let sql = columns.reduce((acc, column) => {
        let expression = pool.format(`?? = ?`, [column, object[column]]);
        if (acc)
            return acc + ', ' + expression;
        else
            return expression;
    }, '');
    return sql
}

function mapToMySQL(member) {
    let result = {...member};
    result.lastRankChange = toMySQLDateTime(member.lastRankChange);
    return result;
}

function toMySQLDateTime(dateString) {
    return new Date(moment(dateString).utc().format('YYYY-MM-DD HH:mm:ss'));
}

function fromMySQLDateTime(dateObject) {
    let date = moment(dateObject);
    let dateAsIs = date.format('YYYY-MM-DD HH:mm:ss');
    if (dateAsIs === '1000-01-01 00:00:00')
        return dateAsIs;
    return date.tz('UTC', true).format('YYYY-MM-DD HH:mm:ss');
}
