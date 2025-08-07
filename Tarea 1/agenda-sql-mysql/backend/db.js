const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // o tu contraseña
  database: 'agenda_db'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Conectado a MySQL!');
});

module.exports = connection;