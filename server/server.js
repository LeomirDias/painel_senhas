require("dotenv").config(); // Carrega as variáveis de ambiente do .env

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const os = require("os");
const queueRoutes = require("./routes/queueRoutes");

const app = express();
const port = process.env.PORT || 3001; // Define a porta que a API rodará

// Descobre o IP local para exibição no log
const localIP = Object.values(os.networkInterfaces())
    .flat()
    .find((iface) => iface.family === "IPv4" && !iface.internal)?.address || "127.0.0.1";

const allowedOrigins = [
    "http://localhost:3000",
    "http://10.0.1.16:3001", // Exemplo de IP fixo
    "http://172.16.200.66"   // IP da VM secundária
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usando as rotas
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

// Criar o servidor HTTP
const server = http.createServer(app);

// Criar o WebSocket
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
    console.log("Cliente WebSocket conectado!");

    ws.on("message", (message) => {
        console.log("Mensagem recebida via WebSocket:", message);
        let url = "";

        if (message === "add-general") {
            url = `http://${localIP}:3001/add-general`;
        } else if (message === "add-preferential") {
            url = `http://${localIP}:3001/add-preferential`;
        }

        if (url) {
            fetch(url, { method: "POST" })
                .then(response => response.json())
                .then(data => console.log("Resposta da API:", data))
                .catch(error => console.error("Erro ao fazer requisição:", error));
        }
    });

    ws.on("close", () => {
        console.log("Cliente WebSocket desconectado.");
    });
});

server.listen(port, "0.0.0.0", () => {
    console.log(`Servidor rodando em:`);
    console.log(`- Local: http://localhost:${port}`);
    console.log(`- Rede: http://${localIP}:${port}`);
});

console.log("Servidor WebSocket rodando na porta 8081");