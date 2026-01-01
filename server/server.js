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
    console.log("\n--- [LOG] Smart Chat Request Received ---");
    const { prompt } = req.body;
    
    // LOG 1: Verify we received the user's question
    console.log(`1. User Prompt: "${prompt}"`); 

    try {
        // === STEP A: GATHER INTELLIGENCE ===
        // 1. Fetch Products
        const allProducts = await Product.find({});
        // LOG 2: Verify Product DB connection
        console.log(`2. Database: Retrieved ${allProducts.length} products.`); 

        // 2. Fetch Employees (NEW!)
        const allEmployees = await Employee.find({});
        // LOG 3: Verify Employee DB connection (Point of failure if missing imports)
        console.log(`3. Database: Retrieved ${allEmployees.length} employees.`);

        // === STEP B: FILTER RELEVANT CONTEXT ===
        const lowerPrompt = prompt.toLowerCase();
        const keywords = lowerPrompt.split(" ");

        // Filter Products
        const relevantProducts = allProducts.filter(p => 
            keywords.some(k => p.name.toLowerCase().includes(k))
        );

        // Filter Employees
        const isAskingAboutStaff = ['employee', 'staff', 'sales', 'performance', 'rating', 'who', 'help', 'anyone'].some(k => lowerPrompt.includes(k));
        let relevantEmployees = [];
        
        if (isAskingAboutStaff) {
            relevantEmployees = allEmployees; // "Manager Mode": Compare everyone
        } else {
            relevantEmployees = allEmployees.filter(e => 
                keywords.some(k => e.name.toLowerCase().includes(k))
            );
        }

        // LOG 4: Verify filtering logic (Did we find what the user asked for?)
        console.log(`4. Context Filtering: Found ${relevantProducts.length} products and ${relevantEmployees.length} employees relevant to query.`);

        // === STEP C: CONSTRUCT THE "BRAIN" ===
        let contextText = "";
        
        // Add Product Data (Now includes HISTORY for price trends)
        if (relevantProducts.length > 0) {
            contextText += "--- PRODUCT DATA ---\n";
            contextText += relevantProducts.map(p => 
                `- Product: ${p.name}\n` +
                `  Current Price: $${p.currentPrice}\n` +
                `  Stock: ${p.stockLevel}\n` +
                `  History: ${JSON.stringify(p.priceHistory)}\n` + // <--- Key for "Price Trend" questions
                `  Benefits: ${p.studentBenefits}`
            ).join("\n\n");
            contextText += "\n\n";
        }

        // Add Employee Data (NEW!)
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
            contextText = "No specific database records matched. Answer based on general retail knowledge.";
        }
        
        // LOG 5: Verify the AI has data to work with
        console.log("5. AI Context Constructed.");

        // === STEP D: THE FINAL PROMPT ===
        const finalPrompt = `
        SYSTEM INSTRUCTION:
        You are a highly intelligent Retail Manager Assistant. 
        You have access to the STORE DATA below.
        
        STRICT BUSINESS RULES:
        1. LOW STOCK: If stock is < 5, explicitly warn the user.
        2. DISCOUNTS: Only mention discounts listed in 'Benefits'.
        3. STAFF ANALYSIS: If asked about employees, compare them based on Sales and Rating.
        4. HISTORY: If asked about price trends, look at the 'History' array.
        5. TRAINING: If an employee's rating is "Needs Improvement", suggest training.
        
        STORE DATA:
        ${contextText}
        
        USER QUESTION:
        ${prompt}
        `;

        // === STEP E: GENERATE RESPONSE ===
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const aiAnswer = response.text();

        // LOG 6: Success! The AI generated a response.
        console.log("6. AI Response Generated.");
        console.log("\n--- [LOG] Request Completed ---\n");

        res.json({ answer: aiAnswer });

    } catch (error) {
        // ERROR LOG: This tells you exactly what crashed
        console.error(" [ERROR] AI Failure:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 5000;

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