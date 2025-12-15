module.exports = app => {
  const Fixass = require("../controllers/fixas.controllers.js");
  const Compras = require("../controllers/compras.controllers.js");

  var router = require("express").Router();

  // FICHAS
  router.post("/api/fixa", Fixass.create);
  router.get("/api/fixa", Fixass.findAll);
  router.get("/api/fixa/:id", Fixass.findOne);
  router.put("/api/fixa/:id", Fixass.update);
  router.delete("/api/fixa/:id", Fixass.delete);
  router.delete("/api/fixa", Fixass.deleteAll);

  // COMPRAS
  router.post("/api/compra", Compras.create);
  // router.get("/api/compra", Compras.findAll);
  router.get("/api/compra/:id", Compras.findAll);
  router.put("/api/compra/:id", Compras.update);
  router.put("/api/compra/grande/:id", Compras.updatesMultiplos);
  

  app.use("/", router);
};