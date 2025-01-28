import logo from './logoReis.png';
import './App.css';
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

function App() {
    const [generalQueue, setGeneralQueue] = useState([]);
    const [preferentialQueue, setPreferentialQueue] = useState([]);
    const [currentPassword, setCurrentPassword] = useState("000");
    const [nextGeneralPassword, setNextGeneralPassword] = useState("G000");
    const [nextPreferentialPassword, setNextPreferentialPassword] = useState("P000");
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [fullScreenPassword, setFullScreenPassword] = useState("");

    const apiUrl = "http://localhost:3001/api"; // Ajuste conforme necessário

    // Função para buscar o estado das filas do servidor
    const fetchQueues = useCallback(async () => {
        try {
            const response = await axios.get(`${apiUrl}/status`);
            const { generalQueue, preferentialQueue, currentPassword } = response.data;

            setGeneralQueue(generalQueue);
            setPreferentialQueue(preferentialQueue);
            setCurrentPassword(currentPassword);

            setNextGeneralPassword(generalQueue.length > 0 ? `G${generalQueue[0]}` : "G000");
            setNextPreferentialPassword(preferentialQueue.length > 0 ? `P${preferentialQueue[0]}` : "P000");
        } catch (error) {
            console.error("Erro ao buscar o estado das filas:", error);
        }
    }, [apiUrl]);

    // Função para chamar a próxima senha
    const callNextPassword = useCallback(async () => {
        try {
            const response = await axios.get(`${apiUrl}/next`);
            const { password } = response.data;

            setFullScreenPassword(password);
            setIsFullScreen(true);

            setTimeout(() => {
                setCurrentPassword(password);
                fetchQueues(); // Atualiza as filas após chamar a senha
                setIsFullScreen(false);
            }, 3000);
        } catch (error) {
            console.error("Erro ao chamar a próxima senha:", error);
        }
    }, [apiUrl, fetchQueues]);

    // Função para chamar uma senha preferencial
    const callPreferentialPassword = useCallback(async () => {
        try {
            const response = await axios.get(`${apiUrl}/preferential`);
            const { password } = response.data;

            setFullScreenPassword(password);
            setIsFullScreen(true);

            setTimeout(() => {
                setCurrentPassword(password);
                fetchQueues(); // Atualiza as filas após chamar a senha
                setIsFullScreen(false);
            }, 3000);
        } catch (error) {
            console.error("Erro ao chamar a senha preferencial:", error);
        }
    }, [apiUrl, fetchQueues]);

    // Função para chamar uma senha comum
    const callGeneralPassword = useCallback(async () => {
        try {
            const response = await axios.get(`${apiUrl}/general`);
            const { password } = response.data;

            setFullScreenPassword(password);
            setIsFullScreen(true);

            setTimeout(() => {
                setCurrentPassword(password);
                fetchQueues(); // Atualiza as filas após chamar a senha
                setIsFullScreen(false);
            }, 3000);
        } catch (error) {
            console.error("Erro ao chamar a senha comum:", error);
        }
    }, [apiUrl, fetchQueues]);

    // Função para resetar as filas no backend
    const resetData = async () => {
        try {
            await axios.post(`${apiUrl}/reset`);
            fetchQueues(); // Atualiza as filas após o reset
        } catch (error) {
            console.error("Erro ao resetar os dados:", error);
        }
    };

    // UseEffect para buscar o estado inicial das filas
    useEffect(() => {
        fetchQueues();
    }, [fetchQueues]);

    // Detecta pressionamento de teclas
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === "c") {
                callNextPassword();
            } else if (event.key === "p") {
                callPreferentialPassword();
            } else if (event.key === "g") {
                callGeneralPassword();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [callNextPassword, callPreferentialPassword, callGeneralPassword]);

    return (
        <>
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
                        <div className="bottom-password" id="next-general">{nextGeneralPassword}</div>
                    </div>

                    <div className="bottom-containers" id="container-preferential">
                        <div className="bottom-label">PREFERENCIAL -</div>
                        <div className="bottom-password" id="next-preferential">{nextPreferentialPassword}</div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default App;
