const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const connectDB = require('./config/db');
const logger = require('./utils/logger'); 
const httpLogger = require('./middleware/httpLogger');
const { initializeAIServices } = require('./config/aiServices');

// Import Routes
const chatRoutes = require('./routes/chatRoutes');
// Import Models (Keep these if you use them directly in server.js or other routes)
const ShiftReport = require('./models/ShiftReport');
const Product = require('./models/Product');
const Employee = require('./models/Employee');
const Transaction = require('./models/Transaction');
const User = require("./models/user");
const crypto = require('crypto');

// 1. Configure Environment
dotenv.config();

logger.info("--- Server Script Starting (Refactored) ---");

// 2. Connect to Database
connectDB();

// 3. Initialize AI Services (Gemini, Azure) - NOW CLEANER!
initializeAIServices();

// 4. Initialize App
const app = express();
app.use(httpLogger);
app.use(express.json());
app.use(cors());

// Configure Multer (For file uploads)
const upload = multer({ storage: multer.memoryStorage() });

// ==========================================
// ROUTES
// ==========================================

// HEALTH CHECK
app.get('/', (req, res) => {
    res.send('Hybrid AI Retail API (Resilient Mode) is running...');
});

// CHAT ROUTE (Linked to the new controller)
app.use('/api/chat', chatRoutes);

// --- KEEPING YOUR EXISTING ROUTES BELOW ---
// (I have kept these as they were in your original file to avoid breaking other features)

// File Upload Route (Azure Blob)
// Note: If you want to refactor this later, we can move it to a uploadController.js
const { getBlobServiceClient } = require('./config/aiServices');

app.post('/api/upload', upload.single('file'), async (req, res) => {
    logger.info("--- File Upload Request ---");
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    try {
        constblobServiceClient = getBlobServiceClient();
        if (!blobServiceClient) throw new Error("Azure Storage not initialized");

        const containerName = "uploads";
        const containerClient = blobServiceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists({ access: 'blob' });

        const blobName = `doc-${Date.now()}-${req.file.originalname}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        logger.info(`Uploading file to Azure: ${blobName}`);
        await blockBlobClient.uploadData(req.file.buffer, {
            blobHTTPHeaders: { blobContentType: req.file.mimetype }
        });

        res.json({ url: blockBlobClient.url });
    } catch (error) {
        logger.error("Upload Failed:", { error: error.message });
        res.status(500).json({ error: "Upload failed: " + error.message });
    }
});

// Employee Route
app.get('/api/employees', async (req, res) => {
    const { node } = req.query; 
    try {
        let query = {};
        if (node && node !== 'All') query = { nodeLocation: node };
        const employees = await Employee.find(query);
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Product Route
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add Employee
app.post('/api/employees', async (req, res) => {
    try {
        const newEmployee = new Employee(req.body);
        await newEmployee.save();
        res.status(201).json(newEmployee);
    } catch (error) {
        res.status(500).json({ message: "Failed to add employee" });
    }
});

// Add Product
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: "Failed to add product" });
    }
});

// Transactions
app.post('/api/transactions', async (req, res) => {
    // ... (Keep your transaction logic here or move to transactionController later)
    // I am keeping it short here for the example, but paste your original transaction logic back if you didn't move it.
    // Let me know if you need me to paste the full transaction logic block again!
    const { employeeId, products, paymentMethod } = req.body;
    try {
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ error: "Employee not found" });

        let totalAmount = 0;
        let totalItems = 0;
        const transactionProducts = [];

        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ error: `Product ID ${item.productId} not found` });
            
            if (product.stockLevel < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }

            const subtotal = product.currentPrice * item.quantity;
            totalAmount += subtotal;
            totalItems += item.quantity;
            product.stockLevel -= item.quantity;
            await product.save();

            transactionProducts.push({
                productId: product._id,
                name: product.name,
                quantity: item.quantity,
                priceAtSale: product.currentPrice,
                subtotal: subtotal
            });
        }

        employee.totalSalesValue += totalAmount;
        employee.itemsSold += totalItems;
        employee.profitGenerated += (totalAmount * 0.20); 
        await employee.save();

        const lastTransaction = await Transaction.findOne().sort({ date: -1 });
        const previousHash = lastTransaction ? lastTransaction.transactionHash : "00000000000000000000000000000000";
        const transactionData = previousHash + employeeId + Date.now() + totalAmount + JSON.stringify(transactionProducts);
        const transactionHash = crypto.createHash('sha256').update(transactionData).digest('hex');

        const newTransaction = new Transaction({
            employeeId, products: transactionProducts, totalAmount, paymentMethod, previousHash, transactionHash
        });

        await newTransaction.save();
        res.status(201).json({ message: "Sale Complete", transaction: newTransaction });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Auth
app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username }).populate('employeeId');
        if (!user || user.password !== password) return res.status(401).json({ success: false, message: "Invalid credentials" });
        
        res.json({
            success: true,
            user: { id: user._id, name: user.name, role: user.role, employeeId: user.employeeId ? user.employeeId._id : null }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Employee Profile
app.get('/api/employees/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Transaction History
app.get('/api/transactions/employee/:id', async (req, res) => {
    try {
        const history = await Transaction.find({ employeeId: req.params.id }).sort({ date: -1 }).limit(50);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Shift Close
app.post('/api/shifts/close', async (req, res) => {
    const { employeeId, actualCash } = req.body;
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        const transactions = await Transaction.find({ employeeId, date: { $gte: startOfDay }, paymentMethod: "Cash" });
        const expectedCash = transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
        const discrepancy = actualCash - expectedCash;
        
        let status = "Matched";
        if (Math.abs(discrepancy) > 0 && Math.abs(discrepancy) < 10) status = "Minor Discrepancy";
        if (Math.abs(discrepancy) >= 10) status = "CRITICAL ALERT";

        const report = new ShiftReport({ employeeId, expectedCash, actualCash, discrepancy, status });
        await report.save();
        res.json({ success: true, report });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Shift Logs
app.get('/api/shifts', async (req, res) => {
    try {
        const reports = await ShiftReport.find().populate('employeeId', 'name nodeLocation').sort({ date: -1 }).limit(50);
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`--- Server is successfully running on port ${PORT} ---`);
});