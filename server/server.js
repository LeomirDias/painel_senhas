require("dotenv").config(); // Carrega as variáveis de ambiente do .env

const express = require("express");
const cors = require("cors");
const os = require("os");

const app = express();
const port = process.env.PORT || 3001;

// Variáveis globais para as filas
let generalQueue = [];
let preferentialQueue = [];
let currentPassword = null;

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Rotas

// Adicionar senha preferencial
app.post("/api/add-preferential", (req, res) => {
    const nextPassword = preferentialQueue.length + 1;
    preferentialQueue.push(nextPassword);
    res.status(200).json({ message: "Senha preferencial adicionada com sucesso.", nextPassword: `P${nextPassword}` });
});

// Adicionar senha geral
app.post("/api/add-general", (req, res) => {
    const nextPassword = generalQueue.length + 1;
    generalQueue.push(nextPassword);
    res.status(200).json({ message: "Senha geral adicionada com sucesso.", nextPassword: `G${nextPassword}` });
});

// Chamar próxima senha balanceada
app.get("/api/next", (req, res) => {
    if (
        preferentialQueue.length > 0 &&
        (preferentialQueue.length > generalQueue.length || generalQueue.length === 0)
    ) {
        const password = `P${preferentialQueue.shift()}`;
        currentPassword = password;
        return res.status(200).json({ password });
    } else if (generalQueue.length > 0) {
        const password = `G${generalQueue.shift()}`;
        currentPassword = password;
        return res.status(200).json({ password });
    }
    res.status(400).json({ message: "Nenhuma senha disponível." });
});

// Buscar o estado atual das filas
app.get("/api/status", (req, res) => {
    res.status(200).json({
        generalQueue,
        preferentialQueue,
        currentPassword: currentPassword || "Nenhuma senha chamada."
    });
});

// Resetar as filas
app.post("/api/reset", (req, res) => {
    generalQueue = [];
    preferentialQueue = [];
    currentPassword = null;
    res.status(200).json({ message: "Dados resetados com sucesso." });
});

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
