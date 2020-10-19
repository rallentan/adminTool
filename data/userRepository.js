const mysql = require('mysql2/promise');
const config = require('../config');
const User = require('../model/User');

const pool = mysql.createPool({
    connectionLimit: 5,
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbDatabase
});

module.exports = {
    addUser: async function addUser(user) {
        let sql = pool.format('INSERT INTO user SET ?', user);
        await pool.query(sql);
    },

    getById: async function getById(id) {
        let [result] = await pool.query('SELECT * FROM user WHERE id = ?', id);
        if (result.length === 0)
            return null;
        let user = result[0];
        Object.setPrototypeOf(user, User);
        return user;
    },

    getByUsername: async function getByUsername(username) {
        let [result] = await pool.query('SELECT * FROM user WHERE username = ?', username);
        if (result.length === 0)
            return null;
        let user = result[0];
        Object.setPrototypeOf(user, User);
        return user;
    },

    getUnapprovedUsers: async function getUnapprovedUsers() {
        let [results] = await pool.query('SELECT id, username FROM user WHERE NOT approved AND NOT suspended');
        return results;
    },

    approveUser: async function approveUser(userId) {
        await pool.query('UPDATE `user` SET approved = 1 WHERE id = ?', userId);
    },

    update: async function update(user) {
        user = mapToMySQL(user);
        let sql = pool.format(`UPDATE \`user\` SET ${prepare(user)} WHERE id = ?`, user.id);
        let [results] = await pool.query(sql);
        return results;
    },
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
