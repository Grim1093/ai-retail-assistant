🛒 AI Retail Assistant

A smart, AI-powered dashboard for retail staff. This application allows frontline employees to instantly query product details, prices, and student discounts using natural language, and view employee performance metrics.

Built for the Microsoft Retail AI Hackathon.

🚀 Tech Stack

Frontend: React (Vite), Tailwind CSS

Backend: Node.js, Express.js

Database: MongoDB (Atlas)

AI Engine: Google Gemini API (switched from OpenAI for this build)

Tools: Axios, Mongoose, Dotenv

📂 Project Structure

ai-retail-assistant/
├── client/          # Frontend (React App)

│   ├── src/

│   ├── package.json

│   └── ...

├── server/          # Backend (Node API)

│   ├── config/      # DB Connection

│   ├── models/      # Mongoose Schemas (Product, Employee)

│   ├── seed.js      # Data Seeding Script

│   ├── server.js    # Main Entry Point

│   └── ...

└── README.md        # This file



🛠️ Setup Instructions

1. Prerequisites

Node.js installed

MongoDB Atlas Account (Connection String ready)

Google Gemini API Key

2. Backend Setup (Server)

Navigate to the server folder:

cd server


Install dependencies:
```
npm install
```

Create a .env file in the server/ folder:
```
PORT=5000
MONGO_URI=mongodb+srv://<your-username>:<password>@cluster.mongodb.net/retail-db
GEMINI_API_KEY=AIzaSy...
```

Seed the Database (Import initial products/employees):
```
node seed.js
```

Start the Server:
```
node server.js
```

Success Message: Server is successfully running on port 5000

3. Frontend Setup (Client)

Open a new terminal and navigate to the client folder:
```
cd client
```

Install dependencies:
```
npm install
```

Start the React App:
```
npm run dev
```

Access App at: http://localhost:5173

🔌 API Documentation

Base URL: http://localhost:5000/api

1. AI Chat Endpoint

Method: POST

Route: /chat

Description: Sends a user question to the AI, which looks up product data in MongoDB and returns an answer.

Body:

{
  "prompt": "How much is the University Hoodie?"
}


Response:

{
  "answer": "The University Hoodie costs $45 and has a Buy 1 Get 1 50% off deal."
}


2. Get All Employees (Coming Soon)

Method: GET

Route: /employees

Description: Returns a list of employee performance metrics for the dashboard.

👥 Team Roles

Pawan (Lead): Backend Architecture, AI Integration (Gemini), Server Logic.

Chetan: Database Design (MongoDB), Schema Modeling, Data Seeding.

Parth: Frontend Design (UI/UX), Tailwind Styling, Component Layout.

Nitish: Frontend Logic, API Integration (Axios), State Management.

🐛 Troubleshooting

"MongoDB Connection Error": Check if your IP is whitelisted in MongoDB Atlas or if the MONGO_URI in .env is correct.

"Gemini Error 404": Ensure you are using a supported model (e.g., gemini-pro or gemini-1.5-flash) and that your API key is valid.

"No products found": Run node seed.js in the server folder to repopulate the database.
