require("dotenv").config();
const { Pool } = require("pg");

console.log("Conectando em:", process.env.DB_HOST, process.env.DB_PORT);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },

  // max: 10,
  // idleTimeoutMillis: 30000,
  // connectionTimeoutMillis: 5000,
});

pool
  .connect()
  .then((client) => {
    console.log("✅ Conectado ao Supabase via Pooler");
    client.release();
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar:", err.message);
  });

module.exports = pool;
