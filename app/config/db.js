require("dotenv").config();
const { Pool } = require("pg");

console.log("Conectando ao banco em:", process.env.DB_HOST);

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false, 
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

console.log("terminou aqui");

module.exports = pool;

// pool.connect((err, client, release) => {
//   if (err) {
//     console.error("Erro ao conectar:", err);
//     process.exit(1);
//   }

//   client.query("SELECT NOW()", (err, res) => {
//     release();
//     if (err) {
//       console.error("Erro na query:", err);
//       process.exit(1);
//     }

//     console.log("Conexão OK! Hora do servidor:", res.rows[0].now);
//     process.exit(0);
//   });
// });
