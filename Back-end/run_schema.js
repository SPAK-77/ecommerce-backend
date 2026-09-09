const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

// Connection with multipleStatements enabled so it can run the whole SQL file at once
const connection = mysql.createConnection({
  host: 'mysql-3a42ea9-arjunvkra2000-8fcb.a.aivencloud.com',
  port: 20545,
  user: 'avnadmin',
  password: 'AVNS_jxWsRfeNKTvQg6NN02Z',
  database: 'defaultdb',
  multipleStatements: true, // Crucial for executing entire .sql files
  ssl: {
    rejectUnauthorized: false
  }
});

// Read your schema.sql file
const sqlFilePath = path.join(__dirname, 'schema.sql');
const sqlQueries = fs.readFileSync(sqlFilePath, 'utf8');

console.log('Running schema.sql on Aiven MySQL...');

connection.query(sqlQueries, (err, results) => {
  if (err) {
    console.error('Error executing schema:', err.message);
  } else {
    console.log('All tables created successfully in Aiven MySQL!');
  }
  connection.end();
});