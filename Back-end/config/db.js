const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'mysql-3a42ea9-arjunvkra2000-8fcb.a.aivencloud.com',
  port: 20545,
  user: 'avnadmin',
  password: 'AVNS_jxWsRfeNKTvQg6NN02Z',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: false // Handles Aiven's REQUIRED SSL mode cleanly
  }
});

// Test the connection
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('Successfully connected to Aiven MySQL cloud database!');
});

module.exports = db;