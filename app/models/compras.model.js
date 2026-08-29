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
      parseFloat(NewCompras.total),
      parseFloat(NewCompras.apagar),
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

const valorPagoPeloClienteTotal = async (id) => {
  try {
    const res = await pool.query(
      `
      SELECT COALESCE(SUM(c.total - c.apagar), 0) AS "valorPago"
      FROM compra c
      WHERE c.apagar != c.total
        AND c.idfixa = $1
      `,
      [id]
    );

    return parseFloat(res.rows[0].valorPago);
  } catch (err) {
    console.log("error:", err);
    throw err;
  }
};

Comprass.findById = async (id, result) => {

  try {

    const valorPagoCliente = await valorPagoPeloClienteTotal(id);

    pool.query(
      `
      WITH Compras_Das_Fixas AS (
        SELECT 
          c.id as compra_id,
          c.criado_em,
          c.total,
          c.tipopag,
          c.idfuncio,
          c.apagar,
          c.idfixa
        FROM compra c
        WHERE c.idfixa = $1
          AND c.apagar <> 0
      )

      SELECT 
        f.id as pessoa_id,
        f.nome,
        f.apelido,
        f.creditomax,
        f.datapaga,
        f.foto,
        c.compra_id,
        c.criado_em,
        c.total,
        c.tipopag,
        c.idfuncio,
        c.apagar

      FROM fixa f

      LEFT JOIN Compras_Das_Fixas c
        ON c.idfixa = f.id

      WHERE f.id = $2

      ORDER BY c.criado_em ASC
      `,
      [id, id],
      (err, res) => {

        if (err) {
          console.log("error:", err);
          result(null, err);
          return;
        }

        if (res.rows.length) {

          let total = 0;
          let compras = [];

          if (res.rows[0].compra_id != null) {

            compras = res.rows.map((r) => ({
              id: r.compra_id,
              dia: r.criado_em,
              total: r.total,
              tipopag: r.tipopag,
              idfuncio: r.idfuncio,
              apagar: r.apagar,
            }));

            for (let i = 0; i < res.rows.length; i++) {
              total += parseFloat(res.rows[i].apagar);
            }

          }

          console.log(compras)

          console.log("dividaTotal:", total);
          console.log("valorPagoCliente:", valorPagoCliente);

          const pessoa = {
            id: res.rows[0].pessoa_id,
            nome: res.rows[0].nome,
            apelido: res.rows[0].apelido,
            creditomax: res.rows[0].creditomax,
            datapaga: res.rows[0].datapaga,
            dividaTotal: total,
            valorPagoC: valorPagoCliente,
            foto: res.rows[0].foto || 'URL_DA_FOTO'
          };

          result(null, {
            pessoa,
            compras
          });

          return;
        }
        

        result(null, null);
      }
    );

  } catch (err) {
      console.log("Erro ao buscar valor pago:", err);
      result(null, err);
  }
};

Comprass.updateById = (id, compras, result) => {
  console.log(compras);
  pool.query(
    "UPDATE compra SET apagar = $1, tipopag = 'Pago'  WHERE id = $2",
    [parseFloat(compras.apagar), id],

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

Comprass.dashboard = async (idmercado) => {
    const QueryMetricas = `
        SELECT
            COALESCE(SUM(c.apagar), 0)::DECIMAL(10,1) AS dividas_totais,
            (
                SELECT COUNT(*)
                FROM fixa
                WHERE idmercado = $1
            ) AS total_fixas,

            COALESCE(
                SUM(
                    CASE
                        WHEN DATE_TRUNC('month', c.criado_em)
                             = DATE_TRUNC('month', CURRENT_DATE)
                        THEN c.apagar
                        ELSE 0
                    END
                ),
                0
            )::DECIMAL(10,1) AS vendas_fiadas_mes,

            COALESCE(
                SUM(
                    CASE
                        WHEN DATE_TRUNC('month', c.atualizado_em)
                             = DATE_TRUNC('month', CURRENT_DATE)
                             AND c.total - c.apagar > 0
                        THEN c.total - c.apagar
                        ELSE 0
                    END
                ),
                0
            )::DECIMAL(10,1) AS recebidos_mes

        FROM fixa f
        JOIN compra c ON c.idfixa = f.id
        WHERE f.idmercado = $1;
    `

    const QueryMaioresContasFiadas = `
        SELECT CAST(SUM(c.apagar) AS DECIMAL(10,2)) AS dividasPorCliente, f.nome from fixa f 
          join compra c on c.idfixa = f.id
          where f.idmercado = $1
          group by f.nome
          order by dividasPorCliente Desc
          limit 5;
    `;

    const QueryTodasComprasFiadas = `
      select COUNT(*) AS total_compras from compra c 
      join fixa f on c.idfixa = f.id
      where f.idmercado = $1 and
      c.apagar > 0;
    `;


    const QueryMaiorCompraFiado = `
      select c.apagar, f.nome from compra c 
      join fixa f on c.idfixa = f.id
      where f.idmercado = $1
      order by c.apagar Desc
      limit 1;
    `;

    const QueryUltimaCompra = `
      select c.total, c.criado_em, f.nome from compra c 
      join fixa f on c.idfixa = f.id
      where f.idmercado = $1
      order by c.criado_em Desc
      limit 1;
    `;


    const QueryComprasDos7Dias = `
      SELECT
          DATE(compra.atualizado_em) AS data,
          SUM(compra.total - compra.apagar) AS total_Recebido
      FROM compra
      join fixa on fixa.id = compra.idfixa
      where fixa.idmercado = $1
      GROUP BY DATE(compra.atualizado_em)
      ORDER BY data desc
      limit 7;
    `;

    const QueryFichasPerdidas = `
      WITH ultima_movimentacao AS (
        SELECT
            f.id,
            f.nome,
            MAX(c.atualizado_em) AS ultima_atividade
        FROM fixa f
        INNER JOIN compra c
            ON c.idfixa = f.id
        where f.idmercado = $1
        GROUP BY
            f.id,
            f.nome
    ),

    status_clientes AS (
        SELECT
            id,
            nome,
            ultima_atividade,

            
          CASE
            WHEN ultima_atividade >= NOW() - INTERVAL '3 months' THEN 'Regular'
            WHEN ultima_atividade >= NOW() - INTERVAL '6 months' THEN 'Em risco'
            ELSE 'Perdido'
          END AS status
            

        FROM ultima_movimentacao
    )

    SELECT
        sc.status,
        COUNT(DISTINCT sc.id) AS quantidade_clientes,
        COALESCE(SUM(c.apagar), 0) AS valor_em_aberto

    FROM status_clientes sc

    INNER JOIN compra c
        ON c.idfixa = sc.id

    WHERE c.apagar > 0

    GROUP BY sc.status

    ORDER BY
        CASE sc.status
            WHEN 'Regular' THEN 1
            WHEN 'Em risco' THEN 2
            WHEN 'Perdido' THEN 3
        END;
    `

    const [
      MetricasIniciais,
      MaioresContasFiadas,
      TodasComprasFiadas,
      MaiorCompraFiado,
      UltimaCompra,
      ComprasDos7Dias,
      FichasPerdidas
    ] = await Promise.all([
      pool.query(QueryMetricas, [idmercado]),
      pool.query(QueryMaioresContasFiadas, [idmercado]),
      pool.query(QueryTodasComprasFiadas, [idmercado]),
      pool.query(QueryMaiorCompraFiado, [idmercado]),
      pool.query(QueryUltimaCompra, [idmercado]),
      pool.query(QueryComprasDos7Dias, [idmercado]),
      pool.query(QueryFichasPerdidas, [idmercado])
    ]);


    return {
      MetricasIniciais: MetricasIniciais.rows[0],
      MaioresContasFiadas: MaioresContasFiadas.rows,
      TodasComprasFiadas: TodasComprasFiadas.rows[0],
      MaiorCompraFiado: MaiorCompraFiado.rows[0],
      UltimaCompra: UltimaCompra.rows[0],
      ComprasDos7Dias: ComprasDos7Dias.rows,
      FichasPerdidas: FichasPerdidas.rows

    };
};

async function pesquisa(id) {
  const res = await pool.query(
    `SELECT c.id, c.total, c.apagar, c.dia
      FROM compra c
      WHERE c.idfixa = $1
      ORDER BY c.dia DESC, c.apagar DESC;`,
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
        parseFloat(novoValor),
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
          let novoValor = parseFloat((compras[vi].apagar - pago).toFixed(2));

          if (novoValor < 0) {
            novoValor = 0;
          }

          console.log(
            `Ficha ID: ${compras[vi].id} | Valor Antigo: ${compras[vi].apagar} | Novo: ${novoValor}`
          );

          await client.query(
            "UPDATE compra SET apagar = $1, tipopag = $2 WHERE id = $3",
            [
              parseFloat(novoValor),
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
