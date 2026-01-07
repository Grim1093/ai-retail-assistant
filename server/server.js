// server/server.js
const User = require("./models/user");
const logger = require('./utils/logger'); // Assuming you have this util
const httpLogger = require('./middleware/httpLogger'); // Assuming you have this middleware

logger.info("--- Server Script Starting (Hybrid Mode: Doc + Language) ---");

// 1. Load Dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const Employee = require('./models/Employee');

// --- AI CLIENTS ---
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { TextAnalysisClient, AzureKeyCredential } = require("@azure/ai-language-text");
const { DocumentAnalysisClient, AzureKeyCredential: DocKeyCredential } = require("@azure/ai-form-recognizer");

logger.info("All dependencies loaded successfully.");

// 2. Configure Environment
dotenv.config();
logger.info("Environment variables configured.");

// 3. Connect to Database
logger.info("Initializing DB connection...");
connectDB();

// 4. Initialize App
const app = express();
app.use(httpLogger);
app.use(express.json());
app.use(cors());
logger.info("Express Middleware Configured (CORS + JSON).");

// ==========================================
// INITIALIZE AI CLIENTS
// ==========================================
let geminiModel;
let languageClient;
let documentClient;

try {
    logger.info("Initializing AI Services...");

    // 1. Google Gemini (The Brain)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    logger.info("✅ Google Gemini Ready.");

    // 2. Azure AI Language (The Analyst)
    if (process.env.AZURE_LANGUAGE_ENDPOINT && process.env.AZURE_LANGUAGE_KEY) {
        languageClient = new TextAnalysisClient(
            process.env.AZURE_LANGUAGE_ENDPOINT, 
            new AzureKeyCredential(process.env.AZURE_LANGUAGE_KEY)
        );
        logger.info("✅ Azure AI Language Ready.");
    } else {
        logger.warn("⚠️ Azure Language Credentials missing.");
    }

    // 3. Azure Document Intelligence (The Reader)
    if (process.env.AZURE_DOCUMENT_ENDPOINT && process.env.AZURE_DOCUMENT_KEY) {
        documentClient = new DocumentAnalysisClient(
            process.env.AZURE_DOCUMENT_ENDPOINT, 
            new DocKeyCredential(process.env.AZURE_DOCUMENT_KEY)
        );
        logger.info("✅ Azure Document Intelligence Ready.");
    } else {
        logger.warn("⚠️ Azure Document Intelligence Credentials missing.");
    }

} catch (err) {
    logger.error("Failed to initialize AI Clients:", { error: err.message });
}

// 6. Health Check Route
app.get('/', (req, res) => {
    res.send('Hybrid AI Retail API is running...');
});

// ==========================================
// HELPER: READ DOCUMENT FROM URL
// ==========================================
async function readDocumentFromUrl(fileUrl) {
    logger.info(`Reading document from: ${fileUrl}`);
    try {
        if (!documentClient) throw new Error("Document Client not initialized");

        // Use the "prebuilt-read" model
        const poller = await documentClient.beginAnalyzeDocument("prebuilt-read", fileUrl);
        const result = await poller.pollUntilDone();

        // Combine text from all pages
        const extractedText = result.pages.map(page => 
            page.lines.map(line => line.content).join(" ")
        ).join("\n\n");
        
        logger.info(`Successfully extracted ${extractedText.length} characters.`);
        return extractedText;
    } catch (err) {
        logger.error("Doc Intelligence Failed:", { error: err.message });
        return `Error reading document: ${err.message}. Ensure URL is publicly accessible.`;
    }
}

// ==========================================
// HYBRID CHAT ROUTE
// ==========================================
app.post('/api/chat', async (req, res) => {
    logger.info("--- Enhanced Chat Request ---");
    
    // 1. Destructure
    const { prompt, history } = req.body;
    let documentContext = "";
    
    logger.trace("Step 1", "Received Prompt", { prompt });
    logger.trace("Step 2", "Memory Received", { messageCount: history ? history.length : 0 });

    try {
        // === STEP A: CHECK FOR DOCUMENTS (Azure Service #2) ===
        // Regex to find http/https links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const foundUrls = prompt.match(urlRegex);

        if (foundUrls && foundUrls.length > 0) {
            const docUrl = foundUrls[0];
            logger.info("Document URL Detected. Switching to Reader Mode...", { url: docUrl });
            
            const rawText = await readDocumentFromUrl(docUrl);
            
            if (rawText.startsWith("Error")) {
                documentContext = `(System Warning: ${rawText})`;
            } else {
                documentContext = `--- CONTENT OF UPLOADED DOCUMENT (${docUrl}) ---\n${rawText}\n-----------------------------------\n`;
            }
        }

        // === STEP B: EXTRACT KEYWORDS (Azure Service #1) ===
        logger.trace("Step 3", "Extracting Keywords via Azure");
        let smartKeywords = prompt.toLowerCase().split(" "); // Fallback

        if (languageClient) {
            try {
                const analysis = await languageClient.analyze("KeyPhraseExtraction", [prompt]);
                if (analysis[0].keyPhrases && analysis[0].keyPhrases.length > 0) {
                    smartKeywords = analysis[0].keyPhrases;
                    logger.trace("Azure Keywords Found", { keywords: smartKeywords });
                }
            } catch (e) {
                logger.warn("Azure Language Analysis failed, using fallback", { error: e.message });
            }
        }

        // === STEP C: FILTER DATABASE ===
        // 1. Fetch Data
        const allProducts = await Product.find({});
        const allEmployees = await Employee.find({});

        // 2. Filter Products
        const relevantProducts = allProducts.filter(p => 
            smartKeywords.some(k => p.name.toLowerCase().includes(k.toLowerCase())) ||
            smartKeywords.some(k => k.toLowerCase().includes(p.name.toLowerCase()))
        );

        // 3. Filter Employees
        const isAskingAboutStaff = ['employee', 'staff', 'sales', 'performance', 'rating', 'who', 'help', 'anyone', 'manager'].some(k => prompt.toLowerCase().includes(k));
        let relevantEmployees = isAskingAboutStaff ? allEmployees : [];

        logger.trace("Step 4", "Context Filtering", { products: relevantProducts.length, employees: relevantEmployees.length });

        // === STEP D: CONSTRUCT "BRAIN" CONTEXT ===
        let contextText = "";
        
        if (relevantProducts.length > 0) {
            contextText += "--- PRODUCT DATA ---\n";
            contextText += relevantProducts.map(p => 
                `- Product: ${p.name}\n` +
                `  Price: $${p.currentPrice} | Stock: ${p.stockLevel}\n` +
                `  Benefits: ${p.studentBenefits}`
            ).join("\n\n");
        }

        if (relevantEmployees.length > 0) {
            contextText += "\n--- EMPLOYEE DATA ---\n";
            contextText += relevantEmployees.map(e => 
                `- Name: ${e.name} (${e.nodeLocation})\n` +
                `  Sales: $${e.totalSalesValue} | Rating: ${e.rating}`
            ).join("\n");
        }

        if (contextText === "") {
            contextText = "No specific database records matched.";
        }

        // === STEP E: FORMAT HISTORY ===
        let conversationHistory = "";
        if (history && history.length > 0) {
            const recentHistory = history.slice(-5);
            conversationHistory = recentHistory.map(msg => 
                `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`
            ).join("\n");
        }

        // === STEP F: GEMINI PROMPT (THE BRAIN) ===
        const finalPrompt = `
        SYSTEM INSTRUCTION:
        You are a highly intelligent Retail Manager Assistant.
        
        SOURCE 1: UPLOADED DOCUMENT (Priority High)
        ${documentContext}
        
        SOURCE 2: STORE DATA (Database)
        ${contextText}
        
        SOURCE 3: MEMORY
        ${conversationHistory}
        
        STRICT BUSINESS RULES:
        1. If 'SOURCE 1' has content, answer primarily using that document.
        2. LOW STOCK: If stock is < 5, warn the user.
        3. STAFF: Compare based on Sales/Rating.
        
        USER QUESTION:
        ${prompt}
        `;

        // === STEP G: GENERATE RESPONSE ===
        logger.trace("Step 5", "Sending to Gemini");
        const result = await geminiModel.generateContent(finalPrompt);
        const aiAnswer = result.response.text();

        logger.info("Request Completed Successfully");
        res.json({ answer: aiAnswer });

    } catch (error) {
        logger.error("AI Failure:", { error: error.message });
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ==========================================
// OTHER ROUTES
// ==========================================

const PORT = process.env.PORT || 5000;

// Employee Route
app.get('/api/employees', async (req, res) => {
    logger.info("--- Employee Data Request ---");
    const { node } = req.query; 
    try {
        let query = {};
        if (node && node !== 'All') {
            query = { nodeLocation: node };
        }
        const employees = await Employee.find(query);
        logger.info(`Found ${employees.length} employees.`);
        res.json(employees);
    } catch (error) {
        logger.error("DB Failure:", { error: error.message });
        res.status(500).json({ message: error.message });
    }
});

// Auth Login Route
app.post("/api/auth/login", async (req, res) => {
  logger.info("--- Login Attempt ---");
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    logger.error("Login Error:", { error: err.message });
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(PORT, () => {
    logger.info(`--- Server is successfully running on port ${PORT} ---`);
    logger.info("Waiting for requests...");
});