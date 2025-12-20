require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
// app.use(cors({ origin: "http://localhost:8081" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Funcionando ate aqui" });
});

require("./app/routes/rotas.routes.js")(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server rodando na porta ${PORT}.`);
});
