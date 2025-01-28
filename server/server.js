const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const queueRoutes = require("./routes/queueRoutes");

const app = express();
const port = 3001;

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Rotas
app.use("/api", queueRoutes);

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});