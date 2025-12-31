# **🛒 AI Retail Assistant**

**A smart, AI-powered dashboard for retail staff.**

This application empowers frontline employees to instantly query product details, prices, and discounts using natural language, as well as track employee performance metrics through a real-time dashboard.

Status: Built for the Microsoft Retail AI Hackathon.  
Current Version: Stable with AI Chat (Gemini Integration) & Analytics Dashboard.

## **🏆 Key Achievements & Features**

We have successfully implemented the following features:

### **1\. 🤖 Context-Aware AI Chat Assistant**

* **Powered by Google Gemini 2.5 Flash:** We successfully migrated from OpenAI to Google's Gemini API for faster, cost-effective inference.  
* **RAG (Retrieval-Augmented Generation):** The AI doesn't just "guess"; it actively searches our **MongoDB inventory** to find relevant product data (Price, Stock, Discounts) and answers user questions based *only* on that verified context.  
* **Natural Language Processing:** Staff can ask questions like *"Do we have the Hoodie in stock?"* or *"What is the student discount for the laptop?"* and get accurate, data-backed responses.

### **2\. 📊 Employee Performance Dashboard**

* **Real-Time Analytics:** Visualizes sales data, profit margins, and customer ratings for every employee in a clean tabular format.  
* **Dynamic Data:** Fetches live data from the backend (/api/employees) rather than using static hardcoded lists.  
* **Clean UI:** Built with **Tailwind CSS v4** for a modern, responsive interface.

### **3\. 🛠️ Robust Backend Architecture**

* **Centralized Server Logic:** Clean separation of concerns with a dedicated server.js entry point.  
* **Database Seeding:** Automated script (seed.js) to populate the database with realistic demo data for products and employees.

## **🚀 Tech Stack**

| Component | Technology |
| :---- | :---- |
| **Frontend** | React (Vite), Tailwind CSS v4, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Atlas), Mongoose |
| **AI Engine** | Google Gemini API (gemini-2.5-flash) |

## **🛠️ Setup Instructions**

Follow these steps to get the project running locally.

### **1\. Prerequisites**

* Node.js installed on your machine.  
* A MongoDB Atlas Account (or local MongoDB).  
* A Google Gemini API Key (Get it from Google AI Studio).

### **2\. Backend Setup**

The backend handles the AI logic and database connections.

\# 1\. Navigate to the server folder  
cd server

\# 2\. Install dependencies  
npm install

\# 3\. Create a .env file  
\# Create a file named ".env" in the server folder and add:  
PORT=5000  
MONGO\_URI=mongodb+srv://\<your-username\>:\<password\>@cluster.mongodb.net/retail-db  
GEMINI\_API\_KEY=AIzaSy...

\# 4\. Seed the Database (Important for first run\!)  
\# This populates MongoDB with dummy products and employees.  
node seed.js

\# 5\. Start the Server  
npm start  
\# OR for development mode (auto-restart on save):  
npm run dev

*Success Output:* Server is successfully running on port 5000

### **3\. Frontend Setup**

The frontend is the user interface for the store staff.

\# 1\. Open a new terminal and navigate to client  
cd client

\# 2\. Install dependencies  
npm install

\# 3\. Start the React App  
npm run dev

*Access the App at:* http://localhost:5173

## **🔌 API Reference**

**Base URL:** http://localhost:5000/api

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| **POST** | /chat | Accepts a { prompt }, searches DB for context (RAG), and returns an AI answer. |
| **GET** | /employees | Returns a list of all employees and their performance metrics. |

## **👥 Team Roles**

* **Pawan (Lead):** Backend Architecture, AI Integration (Gemini), Server Logic.  
* **Chetan:** Database Design (MongoDB), Schema Modeling, Data Seeding.  
* **Parth:** Frontend Design (UI/UX), Tailwind Styling, Component Layout.  
* **Nitish:** Frontend Logic, API Integration (Axios), State Management.

## **🐛 Troubleshooting**

* **"MongoDB Connection Error":** Check if your IP is whitelisted in MongoDB Atlas or if the MONGO\_URI in .env is correct.  
* **"Gemini Error 404":** Ensure you are using the correct model name in server.js (currently set to gemini-2.5-flash) and that your API key is valid.  
* **"No products found":** You must run node seed.js in the server folder at least once to populate the database.  
* **Styles not loading?** Ensure @import "tailwindcss"; is present in client/src/index.css.