const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Helper: Executa consultas no banco de dados
const queryDatabase = async (query, values = []) => {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("Executando query:", query, "Valores:", values);
        const result = await conn.query(query, values);
        console.log("Resultado da query:", result);
        return result;
    } catch (error) {
        console.error("Erro na consulta ao banco de dados:", error);
        throw error;
    } finally {
        if (conn) conn.end();
    }
};

// Rota: Obter o status das filas
router.get("/status", async (req, res) => {
    try {
        const generalQueue = await queryDatabase("SELECT password FROM general_queue ORDER BY id");
        const preferentialQueue = await queryDatabase("SELECT password FROM preferential_queue ORDER BY id");
        const currentPassword = await queryDatabase("SELECT password FROM current_password ORDER BY id DESC LIMIT 1");

        res.json({
            generalQueue: generalQueue.map((row) => row.password),
            preferentialQueue: preferentialQueue.map((row) => row.password),
            currentPassword: currentPassword[0]?.password || "000",
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao obter o status das filas" });
    }
});

// Rota: Adicionar senha preferencial
router.post("/add-preferential", async (req, res) => {
    try {
        const result = await queryDatabase("INSERT INTO preferential_queue (password) VALUES ('TEMP')");
        const nextPassword = `P${result.insertId}`;
        await queryDatabase("UPDATE preferential_queue SET password = ? WHERE id = ?", [nextPassword, result.insertId]);

        res.json({ message: "Senha preferencial adicionada com sucesso.", nextPassword });
    } catch (error) {
        console.error("Erro ao adicionar senha preferencial:", error);
        res.status(500).json({ error: "Erro ao adicionar senha preferencial" });
    }
});

// Rota: Adicionar senha geral
router.post("/add-general", async (req, res) => {
    try {
        const result = await queryDatabase("INSERT INTO general_queue (password) VALUES ('TEMP')");
        const nextPassword = `G${result.insertId}`;
        await queryDatabase("UPDATE general_queue SET password = ? WHERE id = ?", [nextPassword, result.insertId]);

        res.json({ message: "Senha geral adicionada com sucesso.", nextPassword });
    } catch (error) {
        console.error("Erro ao adicionar senha geral:", error);
        res.status(500).json({ error: "Erro ao adicionar senha geral" });
    }
});

// Rota: Chamar próxima senha alternando entre as filas
router.get("/next", async (req, res) => {
    try {
        let nextPassword = null;

        // Primeiro, tenta pegar a próxima senha da fila geral
        const general = await queryDatabase("SELECT id, password FROM general_queue ORDER BY id LIMIT 1");

        if (general.length > 0) {
            nextPassword = general[0].password;
            await queryDatabase("DELETE FROM general_queue WHERE id = ?", [general[0].id]);
            await queryDatabase("INSERT INTO current_password (password) VALUES (?)", [nextPassword]);
        } else {
            // Se a fila geral estiver vazia, tenta pegar da fila preferencial
            const preferential = await queryDatabase("SELECT id, password FROM preferential_queue ORDER BY id LIMIT 1");

            if (preferential.length > 0) {
                nextPassword = preferential[0].password;
                await queryDatabase("DELETE FROM preferential_queue WHERE id = ?", [preferential[0].id]);
                await queryDatabase("INSERT INTO current_password (password) VALUES (?)", [nextPassword]);
            } else {
                // Nenhuma senha disponível
                return res.status(404).json({ error: "Nenhuma senha disponível" });
            }
        }

        res.json({ password: nextPassword });

    } catch (error) {
        console.error("Erro ao chamar a próxima senha:", error);
        res.status(500).json({ error: "Erro ao chamar a próxima senha" });
    }
});

// Rota: Resetar filas
router.post("/reset", async (req, res) => {
    try {
        await queryDatabase("DELETE FROM general_queue");
        await queryDatabase("DELETE FROM preferential_queue");
        await queryDatabase("DELETE FROM current_password");

        // Reinicia os contadores de IDs para começar do 1
        await queryDatabase("ALTER TABLE general_queue AUTO_INCREMENT = 1");
        await queryDatabase("ALTER TABLE preferential_queue AUTO_INCREMENT = 1");
        await queryDatabase("ALTER TABLE current_password AUTO_INCREMENT = 1");

        res.json({ message: "Dados resetados e contagem reiniciada com sucesso" });
    } catch (error) {
        console.error("Erro ao resetar os dados:", error);
        res.status(500).json({ error: "Erro ao resetar os dados" });
    }
});

module.exports = router;
