require("dotenv").config(); // Carrega o .env

const mariadb = require("mariadb");

// Cria a conexão com o banco usando as variáveis do .env
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 50,
});

module.exports = pool;