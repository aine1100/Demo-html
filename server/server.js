const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model, temperature } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: { message: "Messages are required and must be an array." } });
        }

        const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
            model: model || "llama-3.3-70b-versatile",
            messages: messages,
            temperature: temperature || 0.7
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error("API Error:", error.response ? error.response.data : error.message);
        const status = error.response ? error.response.status : 500;
        const errorMessage = error.response?.data?.error?.message || "Internal Server Error";
        res.status(status).json({ error: { message: errorMessage } });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Error: Port ${PORT} is already in use.`);
    } else {
        console.error("Server error:", err);
    }
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log("\nShutting down server...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});
