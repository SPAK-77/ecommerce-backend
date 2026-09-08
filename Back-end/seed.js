const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSeed() {
  try {
    console.log('Connecting to MySQL...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });

    console.log('Resetting database estore...');
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS estore;
      USE estore;
      SET FOREIGN_KEY_CHECKS = 0;
      DROP TABLE IF EXISTS cart_items;
      DROP TABLE IF EXISTS order_items;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS reviews;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS users;
      SET FOREIGN_KEY_CHECKS = 1;
    `);

    console.log('Reading schema.sql...');
    const sqlPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing schema.sql queries...');
    await connection.query(sql);

    console.log('Checking category product counts...');
    const [rows] = await connection.query(`
      SELECT c.id, c.name, COUNT(p.id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON c.id = p.category_id 
      GROUP BY c.id, c.name 
      ORDER BY c.id;
    `);
    console.table(rows);

    const [total] = await connection.query('SELECT COUNT(*) as total_products FROM products;');
    console.log(`🎉 Success! Total products in database: ${total[0].total_products}`);

    await connection.end();
  } catch (err) {
    console.error('❌ Error seeding database:', err);
  }
}

runSeed();
