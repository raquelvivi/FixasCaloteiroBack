const pool = require("../../db.js");
// constructor
const Comprass = function (compras) {
  this.id = compras.id;
  this.dia = compras.dia;
  this.total = compras.total;
  this.apagar = compras.apagar;
  this.tipopag = compras.tipopag;
  this.idfuncio = compras.idfuncio;
  this.idfixa = compras.idfixa;
};

Comprass.create = (NewCompras, result) => {
  pool.query(
    "INSERT INTO compra (dia, total, apagar, tipopag, idfuncio, idfixa) VALUES ($1, $2, $3, $4, $5, $6)",
    [
      NewCompras.dia,
      parseInt(NewCompras.total),
      NewCompras.apagar,
      NewCompras.tipopag,
      NewCompras.idfuncio,
      NewCompras.idfixa,
    ],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log("created compras: ", {
        id: res.insertId,
        ...NewCompras,
      });
      result(null, { id: res.insertId, ...NewCompras });
    }
  );
};

Comprass.findById = (id, result) => {
  const query = `
    SELECT f.id as pessoa_id, f.nome, f.apelido, f.creditomax, f.datapaga,
           c.id as compra_id, c.dia, c.total, c.tipopag, c.idfuncio, c.apagar
    FROM compra c
    JOIN fixa f ON c.idfixa = f.id
    WHERE f.id = ${id}
    ORDER by dia asc
  `;

  pool.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.rows.length) {
      const pessoa = {
        id: res.rows[0].pessoa_id,
        nome: res.rows[0].nome,
        apelido: res.rows[0].apelido,
        creditomax: res.rows[0].creditomax,
        datapaga: res.rows[0].datapaga,
      };

      const compras = res.rows.map((r) => ({
        id: r.compra_id,
        dia: r.dia,
        total: r.total,
        tipopag: r.tipopag,
        idfuncio: r.idfuncio,
        apagar: r.apagar,
      }));

      result(null, { pessoa, compras });
      return;
    }

    result(null, null);
  });
};

Comprass.updateById = (id, compras, result) => {
  console.log(compras);
  pool.query(
    "UPDATE compra SET apagar = $1, tipopag = 'Pago'  WHERE id = $2",
    [parseInt(compras.apagar), id],

    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.rowCount == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      console.log("updated compras: ", { id: id });
      result(null, { id: id });
    }
  );
};

async function pesquisa(id) {
  const res = await pool.query(
    `SELECT c.id, c.total, c.apagar, c.dia
     FROM compra c
     WHERE c.idfixa = $1
     ORDER BY c.dia ASC`,
    [id]
  );

  return res.rows.map((r) => ({
    id: r.id,
    dia: r.dia,
    total: r.total,
    apagar: r.apagar,
  }));
}

async function mudaCompra(id, compras, pago, vezes, lista, result) {
  const client = await pool.connect(); // Usar cliente para transação
  let vi = 0;
  console.log("entrando, lista: ", lista);

  try {
    await client.query("BEGIN"); // Inicia a transação
    if (lista.length == 1) {
      console.log("lista.length == 1");

      let novoValor = compras[vi].apagar - pago;

      if (novoValor <= 0) {
        novoValor = 0;
      }

      console.log("pagar 1, novoValor: ", novoValor);
      console.log("pagar 1, compras[vi].apagar: ", compras[vi].apagar);
      console.log("pagar 1, pago: ", pago);

      await client.query("UPDATE compra SET apagar = $1 WHERE id = $2", [
        parseInt(novoValor),
        compras[vi].id,
      ]);
      pago = pago - compras[vi].apagar; // deu certo então desconta
      console.log("updated compras: ", { id: compras[vi].id });
    } 
    
    
    else {
      console.log("lista.length != 1");
      while (vi < vezes) {
        //vai execultar um put para cada id coletado
        console.log(`compras: ${compras[vi].id} e vi = ${vi}`);
        console.log(`compras: ${compras[vi]} e vi = ${vi}`);
        
        if (compras[vi].apagar != 0) {
          let novoValor = compras[vi].apagar - pago;

          if (novoValor < 0) {
            novoValor = 0;
          }

          console.log(
            `Ficha ID: ${compras[vi].id} | Valor Antigo: ${compras[vi].apagar} | Novo: ${novoValor}`
          );

          await client.query(
            "UPDATE compra SET apagar = $1, tipopag = $2 WHERE id = $3",
            [
              parseInt(novoValor),
              novoValor === 0 ? "Pago" : "Parcial",
              compras[vi].id,
            ]
          );
          pago = pago - compras[vi].apagar; // deu certo então desconta
          console.log("updated compras: ", { id: compras[vi].id });
          if (pago < 0) pago = 0;
        }
        //se valor for maior que o valor da divida então
        //diminui o total de valor porque essa parte ja foi descontada do pagamento
        //e a conta zera
        // if (valor >= compras[vi].apagar) {

        vi++;
      }
    }

    await client.query("COMMIT"); // Salva tudo no banco
    result(null, {
      message: "Pagamentos processados",
    });
  } catch (err) {
    await client.query("ROLLBACK"); // Desfaz tudo em caso de erro
    console.error("Erro na transação:", err);
    result(err);
  } finally {
    client.release();
  }
}

Comprass.updateByIdCompras = async (id, pago, result) => {
  const client = await pool.connect();

  let resultadosPesquisa = await pesquisa(id);

  let v = 0,
    total = 0,
    lista = [],
    vezes = 0,
    compras = [];
  //a questão é ir juntando as migalhas de cada conta, afim de conseguir juntar
  //contas suficientes para descontar o valor total pago usando um while
  while (total < pago) {
    //se total for menor que o valor prosiga porque ainda não temos o suficiente para descontar
    //se a conta não tiver valor a pagar pula (melhora a rapidez)

    if (resultadosPesquisa[v].apagar > 0) {
      total = total + resultadosPesquisa[v].apagar;

      lista.push(resultadosPesquisa[v].id);

      compras.push(resultadosPesquisa[v]);

      vezes++;
    }

    v++;
  }

  console.log("sem zeros: ", lista);
  console.log("sem zeros: ", compras);

  await mudaCompra(id, compras, pago, vezes, lista, result);
};

Comprass.remove = (id, result) => {
  pool.query("DELETE FROM compra WHERE id = $1", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.affectedRows == 0) {
      // not found Aluno with the id
      result({ kind: "not_found" }, null);
      return;
    }
    console.log("deleted compras with id: ", id);
    result(null, res);
  });
};
Comprass.removeAll = (result) => {
  pool.query("DELETE FROM compra", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`deleted ${res.affectedRows} compras`);
    result(null, res);
  });
};
module.exports = Comprass;
