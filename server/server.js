// server/server.js
const User = require("./models/user");
const logger = require('./utils/logger'); 
const httpLogger = require('./middleware/httpLogger');

logger.info("--- Server Script Starting (Resilient Mode: Auto-Fallback) ---");

// 1. Load Dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const Employee = require('./models/Employee');

// --- AI CLIENTS ---
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { TextAnalysisClient, AzureKeyCredential } = require("@azure/ai-language-text");
const { DocumentAnalysisClient, AzureKeyCredential: DocKeyCredential } = require("@azure/ai-form-recognizer");
const { BlobServiceClient } = require('@azure/storage-blob');

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

// Configure Multer
const upload = multer({ storage: multer.memoryStorage() });

logger.info("Express Middleware Configured (CORS + JSON + Multer).");

// ==========================================
// INITIALIZE AI & STORAGE CLIENTS
// ==========================================
let modelPrimary; // Gemma 3-27b (High Intelligence)
let modelBackup;  // Gemma 3-12b (High Efficiency)
let languageClient;
let documentClient;
let blobServiceClient;

try {
    logger.info("Initializing Services...");

    // 1. Google AI (Dual Brains)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Primary: The Heavy Lifter
    modelPrimary = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
    // Backup: The Efficient Runner
    modelBackup = genAI.getGenerativeModel({ model: "gemma-3-12b-it" });
    
    logger.info("✅ Google Gemma 3 (Primary & Backup) Ready.");

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

    // 4. Azure Blob Storage (The Cloud Drive)
    if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
        blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
        logger.info("✅ Azure Blob Storage Ready.");
    } else {
        logger.warn("⚠️ Azure Storage Connection String missing.");
    }

} catch (err) {
    logger.error("Failed to initialize Services:", { error: err.message });
}

// 6. Health Check Route
app.get('/', (req, res) => {
    res.send('Hybrid AI Retail API (Resilient Mode) is running...');
});

// ==========================================
// NEW ROUTE: FILE UPLOAD (Azure Blob)
// ==========================================
app.post('/api/upload', upload.single('file'), async (req, res) => {
    logger.info("--- File Upload Request ---");
    
    if (!req.file) {
        logger.warn("Upload attempt failed: No file provided");
        return res.status(400).json({ error: "No file provided" });
    }

    try {
        if (!blobServiceClient) throw new Error("Azure Storage not initialized");

        const containerName = "uploads";
        const containerClient = blobServiceClient.getContainerClient(containerName);
        
        // Ensure container exists
        await containerClient.createIfNotExists({ access: 'blob' });

        // Generate unique name: doc-TIMESTAMP-originalName
        const blobName = `doc-${Date.now()}-${req.file.originalname}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        logger.info(`Uploading file to Azure: ${blobName}`);
        
        // Upload buffer
        await blockBlobClient.uploadData(req.file.buffer, {
            blobHTTPHeaders: { blobContentType: req.file.mimetype }
        });

        const fileUrl = blockBlobClient.url;
        logger.info(`File Uploaded Successfully: ${fileUrl}`);

        res.json({ url: fileUrl });

    } catch (error) {
        logger.error("Upload Failed:", { error: error.message });
        res.status(500).json({ error: "Upload failed: " + error.message });
    }
});

// ==========================================
// HELPER: READ DOCUMENT FROM URL
// ==========================================
async function readDocumentFromUrl(fileUrl) {
    logger.info(`Reading document from: ${fileUrl}`);
    try {
        if (!documentClient) throw new Error("Document Client not initialized");

        const poller = await documentClient.beginAnalyzeDocument("prebuilt-read", fileUrl);
        const result = await poller.pollUntilDone();

        const extractedText = result.pages.map(page => 
            page.lines.map(line => line.content).join(" ")
        ).join("\n\n");
        
        logger.info(`Successfully extracted ${extractedText.length} characters.`);
        return extractedText;
    } catch (err) {
        logger.error("Doc Intelligence Failed:", { error: err.message });
        // Return a clean error message for Gemini/Gemma to see
        return `Error reading document: ${err.message}`; 
    }
}

// ==========================================
// HELPER: SMART GENERATION (Failover Logic)
// ==========================================
async function generateAIResponse(prompt) {
    try {
        // Attempt 1: Try Primary Model
        // logger.trace("Attempting generation with Primary Model (Gemma 3-27b)...");
        const result = await modelPrimary.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        // If error, switch to Backup
        logger.warn(`⚠️ Primary Model Failed (${err.message}). Switching to Backup (Gemma 3-12b)...`);
        try {
            const result = await modelBackup.generateContent(prompt);
            return result.response.text();
        } catch (backupErr) {
            logger.error("❌ Both Models Failed:", { error: backupErr.message });
            return "I am currently experiencing high traffic. Please try again in a moment.";
        }
    }
}

// ==========================================
// HYBRID CHAT ROUTE
// ==========================================
app.post('/api/chat', async (req, res) => {
    logger.info("--- Enhanced Chat Request ---");
    
    const { prompt, history } = req.body;
    let documentContext = "";
    
    logger.trace("Step 1", "Received Prompt", { prompt });
    logger.trace("Step 2", "Memory Received", { messageCount: history ? history.length : 0 });

    try {
        // === STEP A: CHECK FOR DOCUMENTS (Azure Service #2) ===
        // UPDATED REGEX: Now stops at ')' to prevent capturing the closing parenthesis
        const urlRegex = /(https?:\/\/[^\s)]+)/g; 
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
        let smartKeywords = prompt.toLowerCase().split(" ");

        if (languageClient) {
            try {
                const analysis = await languageClient.analyze("KeyPhraseExtraction", [prompt]);
                if (analysis[0].keyPhrases && analysis[0].keyPhrases.length > 0) {
                    smartKeywords = analysis[0].keyPhrases;
                    // Log safely
                    logger.trace("Azure Keywords Found", { keywords: JSON.stringify(smartKeywords) });
                }
            } catch (e) {
                logger.warn("Azure Language Analysis failed, using fallback", { error: e.message });
            }
        }

        // === STEP C: FILTER DATABASE ===
        const allProducts = await Product.find({});
        const allEmployees = await Employee.find({});

        const relevantProducts = allProducts.filter(p => 
            smartKeywords.some(k => p.name.toLowerCase().includes(k.toLowerCase())) ||
            smartKeywords.some(k => k.toLowerCase().includes(p.name.toLowerCase()))
        );

        // --- UPDATED LOGIC FOR EMPLOYEES ---
        // 1. Check if the user is asking broadly about staff/performance/profit
        const isAskingAboutStaff = ['employee', 'staff', 'sales', 'performance', 'rating', 'who', 'help', 'anyone', 'manager', 'profit', 'profits'].some(k => prompt.toLowerCase().includes(k));
        
        let relevantEmployees = [];

        if (isAskingAboutStaff) {
            // If the query is broad, give the AI access to everyone so it can answer "Who is the best?"
            relevantEmployees = allEmployees;
        } else {
            // 2. If the query is specific (e.g., "How is John?"), check if any employee name matches the keywords
            relevantEmployees = allEmployees.filter(e => 
                smartKeywords.some(k => e.name.toLowerCase().includes(k.toLowerCase())) ||
                smartKeywords.some(k => k.toLowerCase().includes(e.name.toLowerCase()))
            );
        }

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
            // FIX: Added 'profitGenerated' to the output string so the AI can read it.
            contextText += relevantEmployees.map(e => 
                `- Name: ${e.name} (${e.nodeLocation})\n` +
                `  Sales: $${e.totalSalesValue} | Profit: $${e.profitGenerated} | Rating: ${e.rating}`
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

        // === STEP F: GEMMA PROMPT (THE BRAIN) ===
        // This updated prompt instructs Gemma to summarize and recommend.
        const finalPrompt = `
        SYSTEM ROLE:
        You are an expert Retail Manager AI. Your goal is to simplify data for the user.
        
        INPUT DATA:
        1. UPLOADED DOCUMENT (If any):
        ${documentContext}
        
        2. DATABASE INVENTORY:
        ${contextText}
        
        3. CONVERSATION MEMORY:
        ${conversationHistory}
        
        4. USER QUESTION:
        ${prompt}
        
        INSTRUCTIONS FOR DOCUMENT ANALYSIS (Important):
        If there is an Uploaded Document, do NOT just list the text. 
        Instead, follow this format:
        
        1. **Executive Summary**: One sentence explaining what this document is (e.g., "This is an invoice from [Vendor] for [Amount] due on [Date].").
        2. **Key Details**: Bullet points of the most important items/prices only.
        3. **AI Recommendations**:
           - Compare the prices in the document vs. the 'DATABASE INVENTORY' (if matching items exist).
           - e.g., "The invoice price for [Item] is $15, which matches our system." OR "Warning: Invoice price is higher than our standard cost."
           - e.g., "Since the total is high, please get Manager Approval."
        
        INSTRUCTIONS FOR GENERAL CHAT:
        If no document is uploaded, answer the user's question normally using the Database Inventory.
        `;

        // === STEP G: GENERATE RESPONSE (WITH FALLBACK) ===
        logger.trace("Step 5", "Sending to Gemma");
        
        // Use the new failover function instead of direct call
        const aiAnswer = await generateAIResponse(finalPrompt);

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

// 1. Employee Route (GET)
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

// 2. Product Route (GET) - NEW! Added to populate the new table
app.get('/api/products', async (req, res) => {
    logger.info("--- Product Data Request ---");
    try {
        const products = await Product.find({});
        logger.info(`Found ${products.length} products.`);
        res.json(products);
    } catch (error) {
        logger.error("DB Failure:", { error: error.message });
        res.status(500).json({ message: error.message });
    }
});

// 3. Add Employee Route (POST) - NEW
app.post('/api/employees', async (req, res) => {
    logger.info("--- Add Employee Request Received ---");
    try {
        // Log the incoming data to help debug
        logger.trace("Received Data Body:", req.body);

        const { name, itemsSold, totalSalesValue, profitGenerated, avgDiscount, rating, nodeLocation } = req.body;

        // Create new Employee document
        const newEmployee = new Employee({
            name, 
            itemsSold, 
            totalSalesValue, 
            profitGenerated, 
            avgDiscount, 
            rating, 
            nodeLocation
        });

        await newEmployee.save();
        
        logger.info(`✅ New Employee Created: ${name} at ${nodeLocation}`);
        res.status(201).json(newEmployee);
    } catch (error) {
        logger.error("❌ Failed to add employee:", { error: error.message });
        res.status(500).json({ message: "Failed to add employee" });
    }
});

// 4. Add Product Route (POST) - NEW
app.post('/api/products', async (req, res) => {
    logger.info("--- Add Product Request Received ---");
    try {
        logger.trace("Received Data Body:", req.body);

        const { name, category, currentPrice, stockLevel, studentBenefits, isAvailableInOtherNodes } = req.body;

        const newProduct = new Product({
            name, 
            category, 
            currentPrice, 
            stockLevel, 
            studentBenefits, 
            isAvailableInOtherNodes
        });

        await newProduct.save();

        logger.info(`✅ New Product Created: ${name}`);
        res.status(201).json(newProduct);
    } catch (error) {
        logger.error("❌ Failed to add product:", { error: error.message });
        res.status(500).json({ message: "Failed to add product" });
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