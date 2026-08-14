module.exports = app => {
  const Fixass = require("../controllers/fixas.controllers.js");
  const Compras = require("../controllers/compras.controllers.js");
  const Mercado = require("../controllers/mercado.controllers.js");

  var router = require("express").Router();

  // FICHAS
  router.post("/api/fixa", Fixass.create);
  router.get("/api/fixa", Fixass.findAll);
  router.delete("/api/fixa", Fixass.deleteAll);
  router.post("/api/fixa_mercado/porid", Fixass.findOne);

  router.post("/api/mercado/login", Mercado.Login);
  router.post("/api/mercado/login/primeiro_acesso", Mercado.LoginPrimeiroAcesso);
  router.post("/api/mudar_senha/primeiro_acesso", Mercado.mudarSenhaPrimeiroAcesso);

  // COMPRAS
  
  router.post("/api/compra", Compras.create);
  // router.get("/api/compra", Compras.findAll);


  router.get("/api/compra/:id", Compras.findAll);
  router.put("/api/compra/:id", Compras.update);
  router.put("/api/compra/grande/:id", Compras.updatesMultiplos);

  router.get("/api/fixa_mercado/:id", Fixass.findAllMercado);
  router.put("/api/fixa/:id", Fixass.update);
  router.delete("/api/fixa/:id", Fixass.delete);
  router.get("/api/compra/dashboard/:id", Compras.dashboard);
  
  

  app.use("/", router);
};