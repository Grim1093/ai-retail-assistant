# 🛍️ AI Retail Assistant (Imagine Cup Edition)

**A Cloud-Native, Multimodal AI Dashboard for Retail Management.**

This application empowers retail staff to query inventory, upload invoices for automatic analysis, and track performance metrics in real-time. It is built as a Hybrid AI solution, combining the generative power of Google Gemini with the analytical precision of Microsoft Azure AI Services.

**🚀 Status:** Imagine Cup Ready
**☁️ Deployment:** Azure App Service (Planned) | Azure Cosmos DB (Live)

## 🏆 Key Innovations & Features

We have transformed a simple chatbot into a robust, enterprise-grade assistant:

### 1. 🧠 Resilient Hybrid AI (Gemma 3 + Azure)
*   **Auto-Fallback Architecture:** The system prioritizes the powerful **Google Gemma 3 27b-it** for high-intelligence reasoning. If the API is overloaded or unavailable, it automatically switches to the efficient **Gemma 3 12b-it** model without user interruption.
*   **Multimodal RAG (Retrieval-Augmented Generation):** Users can upload PDFs or Images (e.g., invoices, supply lists). The system reads them using Azure Document Intelligence and cross-references the data with our database.
*   **Smart Keyword Extraction:** Uses Azure AI Language to extract precise product keywords from natural language queries, ensuring accurate database filtering.

### 2. ☁️ Cloud-Native Database (Azure Cosmos DB)
*   **Migrated to Azure:** We successfully migrated from a local MongoDB to Azure Cosmos DB for MongoDB (vCore).
*   **Performance:** Hosted in the Southeast Asia region for low-latency access alongside our AI services.
*   **Secure:** Protected by Azure Firewall with IP whitelisting.

### 3. 📂 Enterprise File Handling
*   **Azure Blob Storage:** All uploaded files are securely stored in the cloud using Azure Blob Storage (uploads container).
*   **Paperclip UI:** A seamless "Chat with File" experience in the frontend allows users to upload local documents instantly.

### 4. 📊 Real-Time Analytics Dashboard
*   **Live Metrics:** Visualizes Sales, Profit Margins, and Employee Ratings fetched directly from Cosmos DB.
*   **Modern UI:** Built with React + Tailwind CSS v4 for a responsive, professional interface.

### 5. 🛠️ Manual Data Entry & Inventory Management
*   **Manual Entry:** Managers can now manually add Employees and Products via a modal form, ensuring the database stays up-to-date even without file uploads.
*   **Product Inventory:** A new "Store Inventory & Benefits" table is visible to all users on the Dashboard, providing a clear view of stock levels.
*   **Categorical Ratings:** Employee ratings are now categorical ("Excellent", "Very Good", etc.) providing more meaningful performance insights.

## 🚀 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS v4, Axios, Lucide React |
| **Backend** | Node.js, Express.js, Multer |
| **Database** | Azure Cosmos DB (MongoDB API - vCore) |
| **Storage** | Azure Blob Storage |
| **AI Vision** | Azure Document Intelligence (OCR) |
| **AI Analysis** | Azure AI Language (Key Phrase Extraction) |
| **Generative AI** | Google Gemma 3 (27b-it + 12b-it Auto-Fallback) |

## 🛠️ Setup Instructions

Follow these steps to run the Hybrid AI system locally.

### 1. Prerequisites
*   Node.js installed.
*   Azure Subscription (for Cosmos DB, Storage, and AI Services).
*   Google Gemini API Key.

### 2. Backend Setup

```bash
# 1. Navigate to the server folder
cd server

# 2. Install dependencies (Includes new Azure SDKs)
npm install

# 3. Create a .env file
# Create a file named ".env" in the server folder and add:
PORT=5000

# --- DATABASE (Azure Cosmos DB) ---
MONGO_URI=mongodb+srv://<admin>:<password>@<your-cosmos-db>.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000

# --- GOOGLE AI ---
GEMINI_API_KEY=AIzaSy...

# --- AZURE SERVICES ---
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_LANGUAGE_ENDPOINT=https://<your-resource>.cognitiveservices.azure.com/
AZURE_LANGUAGE_KEY=<your-key>
AZURE_DOCUMENT_ENDPOINT=https://<your-resource>.cognitiveservices.azure.com/
AZURE_DOCUMENT_KEY=<your-key>

# 4. Seed the Database (CRITICAL!)
# This connects to Azure Cosmos DB and populates it with Products, Employees, and the Admin User.
node seed_azure.js

# 5. Start the Server
npm start
```

**Success Output:** `Server is successfully running on port 5000`

### 3. Frontend Setup

```bash
# 1. Open a new terminal and navigate to client
cd client

# 2. Install dependencies
npm install

# 3. Start the React App
npm run dev
```

**Access the App at:** http://localhost:5173

## 🔌 API Reference

**Base URL:** `http://localhost:5000/api`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/auth/login` | Authenticates the user (Admin/Manager). |
| **POST** | `/chat` | Hybrid Route: Detects intent, handles file URLs (Document Intelligence), queries Cosmos DB, and generates an AI response. |
| **POST** | `/upload` | Uploads a local file to Azure Blob Storage and returns a public URL. |
| **GET** | `/employees` | Fetches performance metrics from Cosmos DB. |
| **GET** | `/products` | Fetches current inventory and product details. |
| **POST** | `/products` | Adds a new product to the inventory manually. |
| **POST** | `/employees` | Adds a new employee to the database manually. |

## 👥 Team Roles

*   **Pawan (Team Lead):** Cloud Architecture (Azure Cosmos/Blob), Hybrid AI Logic (Gemini + Azure Services), Backend Resilience & Auto-Fallback.
*   **Chetan:** Database Management, Schema Modeling, Data Seeding Scripts (`seed_azure.js`).
*   **Parth:** Frontend UX/Design, Responsive Layouts, Dashboard Visualization.
*   **Nitish:** Client-Side Logic, API Integration, State Management.

## 🐛 Troubleshooting

*   **"Database Connection Failed / ETIMEDOUT":**
    *   Go to Azure Portal -> Cosmos DB -> Networking.
    *   Click "Add current client IP address" to whitelist your connection.
*   **"White Screen after Login":**
    *   Ensure you ran `node seed_azure.js` (not the old `seed.js`). The new script includes required fields like `profitGenerated`.
*   **"Azure Upload Error":**
    *   Check your `AZURE_STORAGE_CONNECTION_STRING` in `.env`.
    *   Ensure your Blob Container (`uploads`) has Anonymous Access enabled (Blob level).
*   **"AI Model Overloaded (503)":**
    *   No action needed! The system will automatically switch to the backup model (`gemini-1.5-flash`).
