// server/server.js
console.log("Initializing Server...");

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// Import the database connection
const connectDB = require('./config/db');
// Import the Product model to search data
const Product = require('./models/Product');
// Import OpenAI
const OpenAI = require('openai');

dotenv.config();

// 1. Connect to Database
connectDB();

const app = express();

// 2. Middleware
app.use(cors());
app.use(express.json()); 
console.log("Middleware configured.");

// Initialize OpenAI Client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Ensure this is in your .env file
});

// 3. Health Check Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// ==========================================
// PAWAN'S AI CHAT ROUTE (Phase 3)
// ==========================================
app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;
    console.log(`\n[API] Received Chat Request: "${prompt}"`);

    try {
        // Step A: Search the Database for context (Simple Keyword Search)
        // We look for products whose name matches the user's prompt
        console.log("[RAG] Searching database for relevant products...");
        const relevantProducts = await Product.find({
            name: { $regex: prompt, $options: 'i' } // 'i' makes it case-insensitive
        });

        // Step B: Construct the Context String
        let contextText = "";
        if (relevantProducts.length > 0) {
            console.log(`[RAG] Found ${relevantProducts.length} relevant product(s).`);
            contextText = relevantProducts.map(p => 
                `${p.name}: Price $${p.currentPrice}, Stock: ${p.stockLevel}, Discount: ${p.studentBenefits}`
            ).join("\n");
        } else {
            console.log("[RAG] No specific products found in DB for this query.");
            contextText = "No specific product data found in inventory.";
        }

        // Step C: Build the Prompt for AI
        const systemMessage = `
        System: You are a helpful retail assistant.
        Context: Use the following product data to answer the user:
        ${contextText}
        
        Rules:
        1. If the user asks about a specific product in the context, use that exact price/discount.
        2. If the product is not in the context, say you don't have that information.
        `;

        console.log("[AI] Sending prompt to OpenAI...");

        // Step D: Call OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // or "gpt-4" if you have access
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: prompt }
            ],
        });

        const aiAnswer = completion.choices[0].message.content;
        console.log(`[AI] Response generated: "${aiAnswer.substring(0, 50)}..."`);

        // Step E: Send Response back to Frontend
        res.json({ answer: aiAnswer });

    } catch (error) {
        console.error("CRITICAL ERROR in /api/chat:", error.message);
        res.status(500).json({ answer: "Sorry, I encountered an internal server error." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is successfully running on port ${PORT}`);
});