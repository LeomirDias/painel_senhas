import logo from './logoReis.png';
import './App.css';
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

function App() {
    const [generalQueue, setGeneralQueue] = useState([]);
    const [preferentialQueue, setPreferentialQueue] = useState([]);
    const [currentPassword, setCurrentPassword] = useState("000");
    const [errorMessage, setErrorMessage] = useState(null);

    const apiUrl = process.env.REACT_APP_API_URL;

    // Buscar status das filas e senha atual
    const fetchQueues = useCallback(async () => {
        try {
            const response = await axios.get(`${apiUrl}/status`);
            const { generalQueue, preferentialQueue, currentPassword } = response.data;

            setGeneralQueue(generalQueue || []);
            setPreferentialQueue(preferentialQueue || []);
            setCurrentPassword(currentPassword || "000");
        } catch (error) {
            console.error("Erro ao buscar o estado das filas:", error);
        }
    }, [apiUrl]);

    // Adicionar senha à fila preferencial
    const addPreferentialPassword = useCallback(async () => {
        try {
            const response = await axios.post(`${apiUrl}/add-preferential`);
            if (response.status === 200) {
                await fetchQueues();
            }
        } catch (error) {
            console.error("Erro ao adicionar senha preferencial:", error);
        }
    }, [apiUrl, fetchQueues]);

    // Adicionar senha à fila geral
    const addGeneralPassword = useCallback(async () => {
        try {
            const response = await axios.post(`${apiUrl}/add-general`);
            if (response.status === 200) {
                await fetchQueues();
            }
        } catch (error) {
            console.error("Erro ao adicionar senha geral:", error);
        }
    }, [apiUrl, fetchQueues]);

    // Chamar a próxima senha
    const callNextPassword = async () => {
        try {
            const response = await axios.get(`${apiUrl}/next`);
            const data = response.data;

            if (response.status === 200) {
                setCurrentPassword(data.password);
                setErrorMessage(null);
                await fetchQueues(); // Atualiza corretamente as filas
            } else {
                setErrorMessage(data.error);
                setTimeout(() => setErrorMessage(null), 5000);
            }
        } catch (error) {
            setErrorMessage("Nenhuma senha disponível");
            setTimeout(() => setErrorMessage(null), 5000);
        }
    };

    // Resetar as filas
    const resetQueues = useCallback(async () => {
        try {
            const response = await axios.post(`${apiUrl}/reset`);
            if (response.status === 200) {
                setGeneralQueue([]);
                setPreferentialQueue([]);
                setCurrentPassword("000");
            }
            await fetchQueues();
        } catch (error) {
            console.error("Erro ao resetar as filas:", error);
        }
    }, [apiUrl, fetchQueues]);

    // Eventos de teclado para chamar funções
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === "p") {
                addPreferentialPassword();
            } else if (event.key === "g") {
                addGeneralPassword();
            } else if (event.key === "c") {
                callNextPassword();
            } else if (event.key === "r") {
                resetQueues();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [addPreferentialPassword, addGeneralPassword, callNextPassword, resetQueues]);

    // Buscar status no início
    useEffect(() => {
        fetchQueues();
    }, [fetchQueues]);

    // Função para obter a próxima senha correta
    const getNextPassword = (queue) => {
        if (queue.length > 1) {
            return queue[1]; // Próxima senha real
        } else {
            return "000"; // Se não houver próxima senha, exibe 000
        }
    };

    return (
        <main id="sidebar">
            <div id="container-senhas">
                <img src={logo} alt="Logo Reis" id='sidebar__logo' />
                <div id="container-current">
                    <div className="label">SUA VEZ!</div>
                    <div className="password" id="current-password">{currentPassword}</div>
                </div>
            </div>

            <div id="bottom-section">
                <h1>PRÓXIMAS SENHAS:</h1>
                <div className="bottom-containers" id="container-general">
                    <div className="bottom-label">GERAL -</div>
                    <div className="bottom-password">
                        {Array.isArray(generalQueue) && generalQueue.length > 0 ? generalQueue[0] : "000"}
                    </div>
                </div>

                <div className="bottom-containers" id="container-preferential">
                    <div className="bottom-label">PREFERENCIAL -</div>
                    <div className="bottom-password">
                    {Array.isArray(preferentialQueue) && preferentialQueue.length > 0 ? preferentialQueue[0] : "000"}
                    </div>
                </div>
            </div>

            {errorMessage && (
                <div style={{
                    position: "fixed",
                    bottom: "20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "red",
                    color: "white",
                    padding: "10px",
                    borderRadius: "5px",
                    fontSize: "16px",
                    fontWeight: "bold"
                }}>
                    {errorMessage}
                </div>
            )}
        </main>
    );
}

export default App;
