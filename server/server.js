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
    console.log("\n--- 🟢 [LOG] Chat Request Received ---");
    const { prompt } = req.body;
    console.log(`1. User Prompt: "${prompt}"`);

    try {
        // Step A: Search Database for context
        // We fetch ALL products to filter them in JS (Simple RAG for Hackathon)
        const allProducts = await Product.find({});
        console.log(`2. Database Fetch: Retrieved ${allProducts.length} products.`);

        // Step B: Filter relevant products based on user keywords
        const keywords = prompt.toLowerCase().split(" ");
        const relevantProducts = allProducts.filter(p => 
            keywords.some(k => p.name.toLowerCase().includes(k))
        );
        console.log(`3. Context Filtering: Found ${relevantProducts.length} relevant items.`);

        // Step C: Construct the "Context"
        let contextText = "";
        if (relevantProducts.length > 0) {
            contextText = "Here is the store data for the requested items:\n" + 
            relevantProducts.map(p => 
                `- Name: ${p.name}, Price: $${p.currentPrice}, Stock: ${p.stockLevel}, Benefits: ${p.studentBenefits}`
            ).join("\n");
        } else {
            contextText = "No specific products matched the user's query in our database.";
        }
        
        console.log("4. AI Context Constructed.");

        // Step D: Send to Gemini
        // We combine System Instruction + Context + User Prompt into one block
        const finalPrompt = `
        SYSTEM INSTRUCTION:
        You are a helpful Retail Assistant. 
        Use the following STORE DATA to answer the user. 
        If the stock is low (<5), strictly warn the user.
        If the user asks about discounts, check the 'Benefits' field.
        
        STORE DATA:
        ${contextText}
        
        USER QUESTION:
        ${prompt}
        `;

        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const aiAnswer = response.text();

        console.log("5. Gemini Response Generated.");
        console.log("--- 🔴 [LOG] Request Completed ---\n");

        res.json({ answer: aiAnswer });

    } catch (error) {
        console.error("❌ [ERROR] AI Failure:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 5000;
// Add this to server/server.js before app.listen
const Employee = require('./models/Employee');

app.get('/api/employees', async (req, res) => {
    console.log("\n--- 🟢 [LOG] Employee Data Request ---");
    
    // Check if the frontend sent a specific node (e.g., ?node=CampusStore)
    const { node } = req.query; 
    console.log(`1. Filter Requested: ${node || "ALL NODES"}`);

    try {
        let query = {};
        if (node && node !== 'All') {
            query = { nodeLocation: node };
        }

        const employees = await Employee.find(query);
        console.log(`2. Database: Found ${employees.length} employees.`);
        console.log("--- 🔴 [LOG] Request Completed ---\n");
        
        res.json(employees);

    } catch (error) {
        console.error("❌ [ERROR] DB Failure:", error.message);
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n--- Server is successfully running on port ${PORT} ---`);
    console.log("Waiting for requests...\n");
});