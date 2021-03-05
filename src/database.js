const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({
  host: 'dev-priceshoes.cxzdtitkxlft.us-east-2.rds.amazonaws.com',
  user: 'priceshoes',
  password: 'iqOLYxKPgjxMMBdMUDWH',
  database: 'priceAPP',
  multipleStatements: true
});

mysqlConnection.connect(function (err) {
  if (err) {
    console.error(err);
    return;
  } else {
    console.log('db is connected');
  }
});

module.exports = mysqlConnection;
