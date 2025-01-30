require("dotenv").config(); // Carrega as variáveis de ambiente do .env

const express = require("express");
const app = express();
const cors = require("cors");
const os = require("os");
const queueRoutes = require("./routes/queueRoutes");

const port = process.env.PORT || 3001; // Define a porta que a API rodará

const allowedOrigins = ["http://localhost:3000", "http://10.0.1.16:3001"]; // Permite a conexão em determinadas portas

// Middlewares
app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
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

// Descobre o IP local para exibição no log
const localIP = Object.values(os.networkInterfaces())
    .flat()
    .find((iface) => iface.family === "IPv4" && !iface.internal)?.address;

// Inicia o servidor
app.listen(3001, "0.0.0.0", () => {
    console.log(`Servidor rodando em:`);
    console.log(`- Local: http://localhost:${port}`);
    console.log(`- Rede: http://${localIP || "IP não detectado"}:${port}`);
});
