const pool = require("../../db.js");
// constructor
const Fixass = function (fixa) {
  this.id = fixa.id;
  this.nome = fixa.nome;
  this.apelido = fixa.apelido;
  this.logradouro = fixa.logradouro;
  this.numero = fixa.numero;
  this.bairro = fixa.bairro;
  this.creditomax = fixa.creditomax;
  this.datapaga = fixa.datapaga;
  this.foto = fixa.foto;
  this.idmercado = fixa.idmercado;
};

Fixass.create = async (NewFixa, result)  => {

  const client = await pool.connect();

  try {

     await client.query("BEGIN"); // Inicia a transação
  const idCriado = await client.query(
    "INSERT INTO fixa (nome, apelido, logradouro, numero, bairro, creditomax, idmercado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
    [
      NewFixa.nome,
      NewFixa.apelido,
      NewFixa.logradouro || '',
      NewFixa.numero || '0000-000',
      NewFixa.bairro || 'Tranquedo Neves',
      parseFloat(NewFixa.creditomax),
      NewFixa.idmercado
    ]
  );

  await client.query(
    "INSERT INTO compra (dia, total, apagar, tipopag, idfuncio, idfixa) VALUES ($1, $2, $3, $4, $5, $6)",
    [
      '01-01-0001',
      0,
      0,
      0,
      1,
      idCriado.rows[0].id,
    ],
  );
  await client.query("COMMIT"); // Salva tudo no banco

  result(null, { id: idCriado, ...NewFixa });

}catch (err) {
    await client.query("ROLLBACK"); // Desfaz tudo em caso de erro
    console.error("Erro na transação:", err);
    result(err);
  } finally {
    client.release();
  }


}


Fixass.findById = (id, idmercado, result) => {
  console.log("findById id or nome = ", id);

  if (/^\d+$/.test(id)) {
    pool.query("SELECT * FROM fixa WHERE id = $1 AND idmercado = $2", [id, idmercado], (err, res) => {
      if (err) {
        //throw error
        console.log("error: ", err);
        result(err, null);
        return;
      }
      if (res.rows.length) {
        console.log("fixa encontrado: ", res.rows[0]); // isso barra a saida de mais de 1 pessoa
        result(null, res.rows[0]);
        return;
      }
      // not found aluno with the id
      console.log("fixa nao encontrado: res.length = ", res);
      result({ kind: "not_found" }, null);
    });
  } else if (/^[a-zA-Z\s]+$/.test(id)) {
    pool.query(
      `SELECT 
          f.id, f.nome, f.apelido, f.logradouro, f.numero,
          f.creditomax, f.bairro, f.foto, f.datapaga, f.tipofoto,
          SUM(c.apagar) AS total
      FROM 
          compra c
      JOIN 
          fixa f ON c.idfixa = f.id
      WHERE 
          f.nome ILIKE $1 and f.idmercado = $2
      GROUP BY 
          f.id, f.nome, f.apelido, f.logradouro, f.numero,
          f.creditomax, f.bairro, f.foto, f.datapaga,
          f.tipofoto
      ORDER BY 
          f.nome DESC;`,
      [`%${id}%`, idmercado],
      (err, res) => {
        if (err) {
          //throw error
          console.log("error: ", err);
          result(err, null);
          return;
        }
        if (res.rows.length) {
          console.log("fixa encontrado: ", res.rows); // isso permite a saida de varias pessoas
          result(null, res.rows);
          return;
        }
        // not found aluno with the id
        console.log("fixa nao encontrado: res.length = ", res);
        result({ kind: "not_found" }, null);
      }
    );
  } else {
    pool.query("SELECT * FROM fixa WHERE id = $1 AND idmercado = $2", [id], (err, res) => {
      if (err) {
        //throw error
        console.log("error: ", err);
        result(err, null);
        return;
      }
      if (res.rows.length) {
        console.log("fixa encontrado: ", res.rows[0]);
        result(null, res.rows[0]);
        return;
      }
      // not found aluno with the id
      console.log("fixa nao encontrado: res.length = ", res);
      result({ kind: "not_found" }, null);
    });
  }
};

Fixass.getAll = (nome, result) => {
  let query = `SELECT 
     f.id, f.nome, f.apelido, f.logradouro, f.numero,
      f.creditomax, f.bairro,f.foto, f.datapaga, f.tipofoto,
    SUM(c.apagar) as total
FROM 
    compra c
JOIN 
    fixa f 
ON 
    c.idfixa = f.id
GROUP BY 
    f.id
ORDER BY 
    f.nome DESC;
`;

  pool.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    // console.log("fixa: ", res.rows);
    result(null, res);
  });
};

Fixass.findByIdMercado = (idmercado, result) => {
  let query =  `
    SELECT 
      f.id, f.nome, f.apelido, f.logradouro, f.numero,
        f.creditomax, f.bairro,f.foto, f.datapaga, f.tipofoto,
      SUM(c.apagar) as total
    FROM compra c
    JOIN fixa f ON c.idfixa = f.id
    where idmercado = $1
    GROUP BY f.id
    ORDER BY f.nome ASC
    Limit 20;
`;

  pool.query(query, [idmercado], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    // console.log("fixa: ", res.rows);
    result(null, res);
  });
};


Fixass.BuscaTodasFixasDoMercado = (idmercado, result) => {
  let query =  `
    SELECT 
      f.id, f.nome, f.apelido, f.logradouro, f.numero,
        f.creditomax, f.bairro,f.foto, f.datapaga, f.tipofoto,
      SUM(c.apagar) as total
    FROM compra c
    JOIN fixa f ON c.idfixa = f.id
    where idmercado = $1
    GROUP BY f.id
    ORDER BY f.nome ASC
`;

  pool.query(query, [String(idmercado)], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    // console.log("fixa: ", res.rows);
    result(null, res);
  });
};


Fixass.buscandoTodasFixasMercado = (idmercado, result) => {
  console.log(idmercado);
  
  const query = `
    SELECT 
        c.criado_em As dia, c.total, c.apagar, c.id
    FROM 
        compra c
    WHERE 
        c.idfixa = $1 
    ORDER BY 
        c.criado_em DESC;
  `;

  pool.query(query, [idmercado], (err, res) => {
    console.log(query);
    if (err) {
      console.log("error: ", err);
      result(err, null); // Nota: o padrão Node.js costuma passar o erro no 1º parâmetro
      return;
    }
    console.log("fixa: ", res.rows);
    result(null, res.rows); // Retornar res.rows diretamente facilita o envio dos dados pelo Controller
  });
};




Fixass.updateById = (id, fixa, result) => {
  console.log(fixa);
  pool.query(
    "UPDATE fixa SET nome = $1 , apelido = $2 , logradouro = $3 , numero = $4 , bairro = $5 , creditomax = $6 , datapaga = $7  WHERE id = $8",
    [
      fixa.nome,
      fixa.apelido,
      fixa.logradouro,
      fixa.numero,
      fixa.bairro,
      fixa.creditomax,
      fixa.datapaga,
      id,
    ],
    (err, res) => {
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
      console.log("updated fixa: ", { id: id });
      result(null, { id: id });
    }
  );
};
Fixass.remove = (id, result) => {
  pool.query("DELETE FROM fixa WHERE id = $1", id, (err, res) => {
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
    console.log("deleted fixa with id: ", id);
    result(null, res);
  });
};
Fixass.removeAll = (result) => {
  pool.query("DELETE FROM fixa", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`deleted ${res.affectedRows} fixa`);
    result(null, res);
  });
};
module.exports = Fixass;
