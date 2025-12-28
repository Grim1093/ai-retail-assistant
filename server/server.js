// server/server.js
console.log("--- [DEBUG] Server Script Starting ---");

// 1. Load Dependencies (Global Scope)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log("[DEBUG] All dependencies loaded successfully.");

// 2. Configure Environment
dotenv.config();
console.log("[DEBUG] Environment variables configured.");

// 3. Connect to Database
console.log("[DEBUG] Initializing DB connection...");
connectDB();

// 4. Initialize App
const app = express();
app.use(cors());
app.use(express.json());
console.log("[DEBUG] Express Middleware Configured (CORS + JSON).");

// 5. Initialize Gemini
// We use a try/catch here just for the API client initialization
let model;
try {
    console.log("[DEBUG] Initializing Gemini Client...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("[DEBUG] Gemini Model 'gemini-2.5-flash' ready.");
} catch (err) {
    console.error("[CRITICAL] Failed to initialize Gemini:", err.message);
}

// 6. Health Check Route
app.get('/', (req, res) => {
    console.log("[DEBUG] Health Check Triggered");
    res.send('API is running...');
});

// ==========================================
// PAWAN'S AI CHAT ROUTE (With Detailed Logs)
// ==========================================
app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;
    console.log(`\n========================================`);
    console.log(`[API] Received Request: "${prompt}"`);

    try {
        // Step A: Search MongoDB (RAG)
        console.log("[RAG] 1. Searching MongoDB for products...");
        
        const relevantProducts = await Product.find({});

        // Step B: Build Context
        let contextText = "";
        if (relevantProducts.length > 0) {
            console.log(`[RAG] 2. FOUND ${relevantProducts.length} match(es) in DB.`);
            contextText = relevantProducts.map(p => 
                `Product: ${p.name} | Price: $${p.currentPrice} | Stock: ${p.stockLevel} | Discount: ${p.studentBenefits}`
            ).join("\n");
            console.log(`[RAG] 3. Context Data: \n${contextText}`);
        } else {
            console.log("[RAG] 2. NO Matches found in DB.");
            contextText = "No specific product data found in inventory.";
        }

        // Step C: Build AI Prompt
        console.log("[AI] 4. Constructing Prompt for Gemini...");
        const finalPrompt = `
        System: You are a helpful retail assistant.
        Context: Use the following store data to answer the user:
        ${contextText}
        
        Rules:
        1. If the user asks about a specific product in the context, use that exact price/discount.
        2. If the product is not in the context, say you don't have that information.
        
        User Question: ${prompt}
        `;

        // Step D: Call Gemini API
        console.log("[AI] 5. Sending request to Google Gemini API...");
        if (!model) {
            throw new Error("Gemini Model is not initialized.");
        }
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const aiAnswer = response.text();

        console.log(`[AI] 6. Received Response: "${aiAnswer.substring(0, 50)}..."`);

        // Step E: Send to Frontend
        res.json({ answer: aiAnswer });
        console.log("[API] 7. Response sent to client. Request Complete.");

    } catch (error) {
        console.error("[CRITICAL ERROR] in /api/chat:");
        console.error(error);
        res.status(500).json({ answer: "Sorry, I encountered an internal server error." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n--- Server is successfully running on port ${PORT} ---`);
    console.log("Waiting for requests...\n");
});