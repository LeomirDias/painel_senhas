require("dotenv").config(); // Carrega as variáveis de ambiente do .env

const express = require("express");
const cors = require("cors");
const os = require("os");
const queueRoutes = require("./routes/queueRoutes");

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(express.json()); // Substitui bodyParser.json()
app.use(cors());

// Rotas
app.use("/api", queueRoutes);

// Middleware para rotas não encontradas
app.use((req, res) => {
    res.status(404).json({ error: "Rota não encontrada" });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error("Erro inesperado:", err.stack);
    res.status(500).json({ error: "Erro interno do servidor" });
});

// Descobre o IP local para exibição no log
const localIP = Object.values(os.networkInterfaces())
    .flat()
    .find((iface) => iface.family === "IPv4" && !iface.internal)?.address;

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em:`);
    console.log(`- Local: http://localhost:${port}`);
    console.log(`- Rede: http://${localIP || "IP não detectado"}:${port}`);
});
