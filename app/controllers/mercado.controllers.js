const Mercadoss = require("../models/mercado.model.js");

exports.Login = async (req, res = {}) => {
    
  try {
    const data = await Mercadoss.Login(req.body.nome, req.body.senha);
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Erro ao buscar usuario",
    });
  }
};