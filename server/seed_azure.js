// server/seed_azure.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Employee = require('./models/Employee');
const User = require('./models/user');
const { use } = require('react');

dotenv.config();

// --- DATA ---
const products = [
  { name: "Eco-Friendly Water Bottle", currentPrice: 15.00, stockLevel: 100, studentBenefits: "10% off for students", priceHistory: [{ price: 18 }, { price: 16 }, { price: 15 }] },
  { name: "Noise-Cancelling Headphones", currentPrice: 120.00, stockLevel: 45, studentBenefits: "Free case included", priceHistory: [{ price: 150 }, { price: 135 }, { price: 120 }] },
  { name: "Graphic T-Shirt", currentPrice: 20.00, stockLevel: 200, studentBenefits: "Buy 1 Get 1 50% off", priceHistory: [{ price: 25 }, { price: 22 }, { price: 20 }] },
  { name: "Laptop Backpack", currentPrice: 45.00, stockLevel: 30, studentBenefits: "15% off with ID", priceHistory: [{ price: 55 }, { price: 50 }, { price: 45 }] },
  { name: "Wireless Mouse", currentPrice: 25.00, stockLevel: 4, studentBenefits: "5% off", priceHistory: [{ price: 30 }, { price: 28 }, { price: 25 }] },
  { name: "Running Shoes", currentPrice: 80.00, stockLevel: 60, studentBenefits: "10% off", priceHistory: [{ price: 95 }, { price: 85 }, { price: 80 }] },
  { name: "Smart Watch", currentPrice: 150.00, stockLevel: 15, studentBenefits: "Free screen protector", priceHistory: [{ price: 180 }, { price: 160 }, { price: 150 }] }
];

// FIXED: Refactored ratings to be Categorical Strings
const employees = [
  { 
    name: "Alice Johnson", 
    nodeLocation: "Main Counter", 
    totalSalesValue: 12500, 
    profitGenerated: 3200, 
    itemsSold: 450, 
    rating: "Excellent", // Was 4.8
    avgDiscount: 5.2 
  },
  { 
    name: "Bob Smith", 
    nodeLocation: "Campus Store", 
    totalSalesValue: 18200, 
    profitGenerated: 4500, 
    itemsSold: 120, 
    rating: "Very Good", // Was 4.5
    avgDiscount: 8.5 
  },
  { 
    name: "Charlie Davis", 
    nodeLocation: "Kiosk A", 
    totalSalesValue: 8400, 
    profitGenerated: 2100, 
    itemsSold: 600, 
    rating: "Excellent", // Was 4.9
    avgDiscount: 12.0 
  },
  { 
    name: "Diana Prince", 
    nodeLocation: "Main Counter", 
    totalSalesValue: 5000, 
    profitGenerated: 1200, 
    itemsSold: 90, 
    rating: "Good", // Was 4.2
    avgDiscount: 2.5 
  }
];

const users = [
  {
    username: "admin",
    password: "123",
    name: "Pawan (Admin)",
    role: "manager"
  },

  {
    username: "staff",
    password: "123",
    name: "Rohan(Staff1)",
    role: "staff"
  }
];

// --- SEED FUNCTION ---
const seedDB = async () => {
  try {
    console.log("Connecting to Azure Cosmos DB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected!");

    console.log("Clearing old data...");
    await Product.deleteMany({});
    await Employee.deleteMany({});
    await User.deleteMany({}); 

    console.log("Inserting Products...");
    await Product.insertMany(products);

    console.log("Inserting Employees...");
    await Employee.insertMany(employees);

    console.log("Inserting Admin User...");
    await User.insertMany(users); 

    console.log("🎉 Database seeded successfully! Login with 'admin' / 'password123'");
    process.exit();
  } catch (err) {
    console.error("❌ Seed Error:", err);
    process.exit(1);
  }
};

seedDB();