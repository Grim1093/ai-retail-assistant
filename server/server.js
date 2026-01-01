// server/server.js
console.log("--- [DEBUG] Server Script Starting ---");

// 1. Load Dependencies (Global Scope)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const Employee = require('./models/Employee');
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
// PAWAN'S AI CHAT ROUTE (With Memory + Logs)
// ==========================================
app.post('/api/chat', async (req, res) => {
    console.log("\n--- 🧠 [LOG] Enhanced Chat Request ---");
    
    // 1. Destructure 'history' along with 'prompt'
    const { prompt, history } = req.body;
    
    // LOG 1: Verify we received the user's question and history
    console.log(`1. User Prompt: "${prompt}"`); 
    console.log(`2. Memory: Received ${history ? history.length : 0} previous messages.`);

    try {
        // === STEP A: GATHER INTELLIGENCE ===
        // 1. Fetch Products
        const allProducts = await Product.find({});
        // 2. Fetch Employees
        const allEmployees = await Employee.find({});
        
        // LOG 3: Verify DB connection
        console.log(`3. Database: Retrieved ${allProducts.length} products and ${allEmployees.length} employees.`); 

        // === STEP B: FILTER RELEVANT CONTEXT ===
        const lowerPrompt = prompt.toLowerCase();
        const keywords = lowerPrompt.split(" ");

        // Filter Products
        const relevantProducts = allProducts.filter(p => 
            keywords.some(k => p.name.toLowerCase().includes(k))
        );

        // Filter Employees (Using the "help/anyone" fix from Phase 3)
        const isAskingAboutStaff = ['employee', 'staff', 'sales', 'performance', 'rating', 'who', 'help', 'anyone'].some(k => lowerPrompt.includes(k));
        let relevantEmployees = [];
        
        if (isAskingAboutStaff) {
            relevantEmployees = allEmployees; // "Manager Mode": Compare everyone
        } else {
            // "Specific Person Mode" OR context carry-over mode
            // If the user asks "What about him?", we might not have a name keyword.
            // We default to sending ALL employees if the history suggests we are talking about people.
            // For simplicity in Phase 4, we send filtered matches OR empty.
            relevantEmployees = allEmployees.filter(e => 
                keywords.some(k => e.name.toLowerCase().includes(k))
            );
        }

        // LOG 4: Verify filtering logic
        console.log(`4. Context Filtering: Found ${relevantProducts.length} products and ${relevantEmployees.length} employees relevant to query.`);

        // === STEP C: CONSTRUCT THE "BRAIN" (Data Context) ===
        let contextText = "";
        
        if (relevantProducts.length > 0) {
            contextText += "--- PRODUCT DATA ---\n";
            contextText += relevantProducts.map(p => 
                `- Product: ${p.name}\n` +
                `  Current Price: $${p.currentPrice}\n` +
                `  Stock: ${p.stockLevel}\n` +
                `  History: ${JSON.stringify(p.priceHistory)}\n` +
                `  Benefits: ${p.studentBenefits}`
            ).join("\n\n");
            contextText += "\n\n";
        }

        if (relevantEmployees.length > 0) {
            contextText += "--- EMPLOYEE PERFORMANCE DATA ---\n";
            contextText += relevantEmployees.map(e => 
                `- Name: ${e.name} (${e.nodeLocation})\n` +
                `  Sales: $${e.totalSalesValue}\n` +
                `  Items Sold: ${e.itemsSold}\n` + 
                `  Rating: ${e.rating}\n` +
                `  Avg Discount Given: ${e.avgDiscount}%`
            ).join("\n\n");
        }

        if (contextText === "") {
            contextText = "No specific database records matched the current keywords. Answer based on general knowledge or Conversation History.";
        }
        
        console.log("5. Data Context Constructed.");

        // === STEP D: FORMAT HISTORY (The Upgrade) ===
        // Convert array of objects to a script format: "User: ... \n AI: ..."
        let conversationHistory = "";
        if (history && history.length > 0) {
            const recentHistory = history.slice(-5); // Keep last 5 turns to save tokens
            conversationHistory = recentHistory.map(msg => 
                `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`
            ).join("\n");
        }
        console.log("6. Conversation History Formatted.");

        // === STEP E: THE FINAL PROMPT ===
        const finalPrompt = `
        SYSTEM INSTRUCTION:
        You are a highly intelligent Retail Manager Assistant.
        
        SOURCE 1: STORE DATA (Database)
        ${contextText}
        
        SOURCE 2: CONVERSATION HISTORY (Memory)
        ${conversationHistory}
        
        STRICT BUSINESS RULES:
        1. LOW STOCK: If stock is < 5, explicitly warn the user.
        2. STAFF ANALYSIS: If asked about employees, compare them based on Sales and Rating.
        3. HISTORY: If asked about price trends, look at the 'History' array in Store Data.
        4. CONTEXT: If the user asks "What is his rating?" or "How much is it?", look at the CONVERSATION HISTORY to identify the subject (Product or Employee).
        
        USER QUESTION:
        ${prompt}
        `;

        // === STEP F: GENERATE RESPONSE ===
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const aiAnswer = response.text();

        // LOG 7: Success!
        console.log("7. AI Response Generated with Memory.");
        console.log("\n--- [LOG] Request Completed ---\n");

        res.json({ answer: aiAnswer });

    } catch (error) {
        console.error(" [ERROR] AI Failure:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 5000;

app.get('/api/employees', async (req, res) => {
    console.log("\n--- 🟢 [LOG] Employee Data Request ---");
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