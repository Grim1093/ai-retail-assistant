// server/controllers/chatController.js
const logger = require('../utils/logger');
const Product = require('../models/Product');
const Employee = require('../models/Employee');
const { getPrimaryModel, getBackupModel, getLanguageClient, getDocumentClient } = require('../config/aiServices');

// ... (Keep the readDocumentFromUrl and generateAIResponse helpers exactly as they were) ...
// (I will omit them here to save space, but DO NOT DELETE THEM from your file)
// Just ensure 'generateAIResponse' and 'readDocumentFromUrl' are still defined above.
// If you need me to paste them again, let me know!

// --- HELPER: Read Document from URL ---
async function readDocumentFromUrl(fileUrl) {
    try {
        const documentClient = getDocumentClient();
        if (!documentClient) return ""; // Fail silently if no client
        const poller = await documentClient.beginAnalyzeDocument("prebuilt-read", fileUrl);
        const result = await poller.pollUntilDone();
        return result.pages.map(page => page.lines.map(line => line.content).join(" ")).join("\n\n");
    } catch (err) { return `Error: ${err.message}`; }
}

async function generateAIResponse(prompt) {
    try {
        const modelPrimary = getPrimaryModel();
        const result = await modelPrimary.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        try {
            const modelBackup = getBackupModel();
            const result = await modelBackup.generateContent(prompt);
            return result.response.text();
        } catch (e) { return JSON.stringify({ message: "Service busy.", metrics: null }); }
    }
}

// --- MAIN CONTROLLER ---
exports.handleChat = async (req, res) => {
    const startTime = Date.now();
    logger.info("--- Chat Request Received ---");
    
    const { prompt } = req.body;
    
    try {
        // 1. Parallel Data Fetch
        const urlRegex = /(https?:\/\/[^\s)]+)/g; 
        const foundUrls = prompt.match(urlRegex);
        const docPromise = (foundUrls && foundUrls.length > 0) ? readDocumentFromUrl(foundUrls[0]) : Promise.resolve(""); 

        const productsPromise = Product.find({}).lean();
        const employeesPromise = Employee.find({}).lean(); 

        const [rawDocText, allProducts, allEmployees] = await Promise.all([docPromise, productsPromise, employeesPromise]);

        // 2. Filter Logic
        const smartKeywords = prompt.toLowerCase().split(" ");
        const isAskingAboutStaff = ['employee', 'staff', 'sales', 'performance', 'rating', 'profit', 'stats', 'metrics'].some(k => prompt.toLowerCase().includes(k));
        
        let relevantEmployees = [];
        if (isAskingAboutStaff) {
            const nameMatch = allEmployees.filter(e => prompt.toLowerCase().includes(e.name.toLowerCase()));
            relevantEmployees = nameMatch.length > 0 ? nameMatch : allEmployees;
        } else {
            relevantEmployees = allEmployees.filter(e => smartKeywords.some(k => e.name.toLowerCase().includes(k.toLowerCase())));
        }

        const relevantProducts = allProducts.filter(p => 
            smartKeywords.some(k => p.name.toLowerCase().includes(k.toLowerCase())) ||
            smartKeywords.some(k => p.category && p.category.toLowerCase().includes(k.toLowerCase()))
        );

        // === STEP 3: CONSTRUCT CONTEXT (UPDATED) ===
        let contextText = "";
        if (relevantEmployees.length > 0) {
            contextText += "--- EMPLOYEE DATA ---\n" + relevantEmployees.map(e => 
                `- Name: ${e.name}\n` +
                `  Sales: $${e.totalSalesValue} | Profit: $${e.profitGenerated}\n` + 
                `  Items Sold: ${e.itemsSold} | Avg Discount: ${e.avgDiscount}%\n` +
                `  Rating: ${e.rating}`
            ).join("\n") + "\n";
        }

        if (relevantProducts.length > 0) {
            contextText += "--- PRODUCT DATA ---\n" + relevantProducts.map(p => 
                // <--- CRITICAL FIX: Added 'Benefits: ${p.studentBenefits}'
                `- Product: ${p.name} | Stock: ${p.stockLevel} | Price: $${p.currentPrice} | Benefits: ${p.studentBenefits}`
            ).join("\n") + "\n";
        }
        
        if (!contextText) contextText = "No specific database records matched.";
        const documentContext = rawDocText ? `--- DOC ---\n${rawDocText}\n` : "";

        // === STEP 4: STRICT PROMPT ===
        const finalPrompt = `
        SYSTEM ROLE: Expert Retail Manager AI.
        
        RULES:
        1. Return strictly VALID JSON.
        2. IF asking about EMPLOYEES: Populate "metrics" with ALL available data.
        3. IF asking about STOCK: Populate "products" array with REAL items.
        4. IF NO specific products/employees found: Keep arrays/objects empty.
        
        DATA:
        ${documentContext}
        ${contextText}
        Query: ${prompt}

        OUTPUT FORMAT:
        {
            "message": "Conversational response. Mention student benefits if relevant.",
            "products": [ 
                { "name": "Item", "stock": 0, "price": 0, "benefits": "Description" } 
            ],
            "metrics": {
                "sales": 0, 
                "profit": 0, 
                "itemsSold": 0,
                "avgDiscount": 0,
                "rating": "String" 
            }
        }
        `;

        // 5. Generate & Send
        const rawResponse = await generateAIResponse(finalPrompt);
        let parsedResponse = { message: rawResponse, metrics: null, products: [] };
        try {
            const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedResponse = JSON.parse(cleanJson);
        } catch (e) {}

        res.json({ 
            answer: parsedResponse.message, 
            stats: parsedResponse.metrics,
            products: parsedResponse.products 
        });

    } catch (error) {
        logger.error("Error", error);
        res.status(500).json({ error: "Server Error" });
    }
};