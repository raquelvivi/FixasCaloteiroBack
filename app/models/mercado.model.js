
const pool = require("../../db.js");

const Mercadoss = function (mercado) {
  this.id = mercado.id;
  this.nome = mercado.nome;
  this.senha = mercado.senha;
}

Mercadoss.LoginPrimeiroAcesso = async (nome, senha) => {

  var res = null;
  if(nome[0] === '#'){
    res = await pool.query(
      `SELECT id from mercado 
      where nome = $1 
      and 
      senha = $2;`, [nome, senha]);
  }
  else{
    res = await pool.query(
      `SELECT id from fixa 
      where nome = $1 
      and 
      senha = $2;`, [nome, senha]
    );
  }
  
  console.log("res.rows: ", res.rows[0]);
  return res.rows[0] ;

}

Mercadoss.Login = async (nome, senha) => {

  const bcrypt = require("bcrypt");

  var res = null;
  if(nome[0] === '#'){
    res = await pool.query(
      `SELECT id, senha from mercado 
      where nome = $1 `, [nome]);
  }
  else{
    res = await pool.query(
      `SELECT id, senha from fixa 
      where nome = $1 `, [nome]
    );
  }

  if(res.rows.length === 0){
    return false;
} 
const confere = await bcrypt.compare(
    senha,
    res.rows[0].senha
);

if(confere){
    return {id: res.rows[0].id};
}else{
    console.log("Senha errada");
    return false;
}

}

Mercadoss.mudarSenhaPrimeiroAcesso = async (id, senha) => {

  const bcrypt = require("bcrypt");

  const hash = await bcrypt.hash(senha, 10);

  console.log(hash);

  var resposta = null

  if(id[0] === 'M'){

    resposta = await pool.query(`
      update mercado set senha = $1
      where id = $2
      `, [hash, id]);

  }else{
    
    resposta = await pool.query(`
      update fixa set senha = $1
      where id = $2
      `, [hash, id]);
  }

  console.log("resposta: ", resposta);
  return resposta;
}



module.exports = Mercadoss;