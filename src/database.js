const mysql = require('mysql');
const { promisify } = require('util');

const config = {
    host: 'dev-priceshoes.cxzdtitkxlft.us-east-2.rds.amazonaws.com',
    user: 'priceshoes',
    password: 'iqOLYxKPgjxMMBdMUDWH',
    database: 'priceAPP'
}

const pool = mysql.createPool(config);

pool.getConnection((err, con) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('CONNECTION DATABASE WAS CLOSED');
        }

        if (error.code === 'ER_CON_COUNT_ERROR') {
            console.error('DATABASE HAS MANY CONNECTIONS');
        }

        if (err.code === 'ECONNREFUSED') {
            console.error('DATABASE CONNETION WAS REFUSED');
        }
    }

    if (con) con.release(); //Init connection
    console.log('DB IS CONNECT');
    return;
});

pool.query = promisify(pool.query); //allow use asyn-await

module.exports = pool;