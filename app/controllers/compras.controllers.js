const Compras = require("../models/compras.model.js");

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "body vaziu",
    });
  }

  const comprasBody = new Compras({
    id: req.body.id || null,
    dia: req.body.dia || null,
    total: req.body.total || null,
    apagar: req.body.apagar || null, // 'a pagar' no sentido de que 'falta pagar'
    tipopag: req.body.tipopag || null,
    idfuncio: req.body.idfuncio || null,
    idfixa: req.body.idfixa || null,
  });

  Compras.create(comprasBody, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Erro ao criar Compras (controllers)",
      });
    else res.send(data);
  });
};

// exports.findAll = (req, res) => {
//   const nome = req.query.nome;
//   Compras.getAll(nome, (err, data) => {
//     if (err)
//       res.status(500).send({
//         message: err.message || "(controllers) Erro ao puchar os dados",
//       });
//     else {
//       //res.send(data);
//       res.status(200).json(data.rows);
//     }
//   });
// };

exports.findAll = (req, res) => {
  console.log(req.body);
  Compras.findById(req.params.id, (err, data) => {

    
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `(controllers) pesquisa nao encontrada com id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Erro ao buscar (controllers) " + req.params.id,
        });
      }
    } else res.send(data);
  });
};


exports.update = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Body Vaziu",
    });
  }
  console.log(req.body);
  Compras.updateById(
    req.params.id,
    new Compras(req.body),

    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `(controllers) erro ao achar a fixa com id:
${req.params.id}.`,
          });
        } else {
          res.status(500).send({
            message:
              "(controllers) erro ao mudar fixa com id: " + req.params.id,
          });
        }
      } else res.send(data);
    }
  );
};



exports.updatesMultiplos = (req, res) => {

  if (!req.body) {
    return res.status(400).send({
      message: "Body Vaziu",
    });
  }
 
  
  Compras.updateByIdCompras(
    req.params.id,
    req.body.pago,

    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `(controllers) erro ao achar a fixa com id:
${req.params.id}.`,
          });
        } else {
          res.status(500).send({
            message:
              "(controllers) erro ao mudar compra com id: " + req.params.id,
          });
        }
      } else res.send(data);
    }
  );
};

exports.delete = (req, res) => {
  Compras.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `(controllers) erro ao achar fixa com id:
${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message:
            "(controllers) erro ao deletar fixa com id: " + req.params.id,
        });
      }
    } else
      res.send({
        message: `Compras was deleted successfully!`,
      });
  });
};

exports.deleteAll = (req, res) => {
  Compras.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Compras.",
      });
    else
      res.send({
        message: `All Comprass were deleted
successfully!`,
      });
  });
};
