
const pool = require("../../db.js");

const Mercadoss = function (mercado) {
  this.id = mercado.id;
  this.nome = mercado.nome;
  this.senha = mercado.senha;
}

Mercadoss.Login = async (nome, senha) => {

  const res = await pool.query(
    `SELECT id from mercado 
    where nome = $1 
    and 
    senha = $2;`, [nome, senha]
  );

  return res.rows[0].id || 0;
}


module.exports = Mercadoss;