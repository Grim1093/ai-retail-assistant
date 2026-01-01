// server/seed.js
console.log("--- [DEBUG] Starting Seed Script ---");

// 1. Load Dependencies (Global Scope)
const dotenv = require("dotenv");
const mongoose = require('mongoose');

// Note: Ensure these file names match exactly (Case Sensitive on Linux/Mac)
const Employee = require("./models/employee"); 
const Product = require("./models/Product");
const connectDB = require("./config/db");

console.log("[DEBUG] Dependencies loaded successfully.");

// 2. Configure Environment
dotenv.config();
console.log("[DEBUG] Environment Configured.");

// 3. Connect to Database
console.log("[DEBUG] Attempting to connect to MongoDB...");
connectDB();

const importData = async () => {
  try {
    console.log("\n[DEBUG] Starting Data Import Process...");

    // 4. Clear Old Data
    console.log("[DEBUG] Deleting old Employees...");
    await Employee.deleteMany();
    console.log("[DEBUG] ✔ Old Employees Deleted.");

    console.log("[DEBUG] Deleting old Products...");
    await Product.deleteMany();
    console.log("[DEBUG] ✔ Old Products Deleted.");

    // 5. Prepare Employee Data
    console.log("[DEBUG] Preparing new Employee data...");
  const employees = [
  // Team A: Main Counter
  {
    name: "Employee A (Main)",
    itemsSold: 156,
    totalSalesValue: 4680,
    profitGenerated: 1404,
    avgDiscount: 8,
    rating: "Excellent",
    nodeLocation: "Main Counter"
  },
  {
    name: "Employee B (Main)",
    itemsSold: 142,
    totalSalesValue: 4260,
    profitGenerated: 1278,
    avgDiscount: 10,
    rating: "Very Good",
    nodeLocation: "Main Counter"
  },

  // Team B: Campus Store
  {
    name: "Employee C (Campus)",
    itemsSold: 128,
    totalSalesValue: 3840,
    profitGenerated: 1152,
    avgDiscount: 12,
    rating: "Good",
    nodeLocation: "Campus Store"
  },
  {
    name: "Employee D (Campus)",
    itemsSold: 119,
    totalSalesValue: 3570,
    profitGenerated: 1071,
    avgDiscount: 15,
    rating: "Satisfactory",
    nodeLocation: "Campus Store"
  },

  // Team C: Kiosk
  {
    name: "Employee E (Kiosk)",
    itemsSold: 105,
    totalSalesValue: 3150,
    profitGenerated: 945,
    avgDiscount: 18,
    rating: "Needs Improvement",
    nodeLocation: "Kiosk A"
  }
];


    // 6. Insert Employees
    console.log(`[DEBUG] Inserting ${employees.length} Employees...`);
    await Employee.insertMany(employees);
    console.log("[DEBUG] ✔ Employees Imported Successfully.");

    // 7. Prepare Product Data
    console.log("[DEBUG] Preparing new Product data...");
    const products = [
      {
        name: "Wireless Headphones",
        category: "Electronics",
        currentPrice: 150,
        stockLevel: 12,
        priceHistory: [{ date: new Date("2023-01-01"), price: 160 }],
        studentBenefits: "15% off with Valid ID",
        isAvailableInOtherNodes: true
      },
      {
        name: "University Hoodie",
        category: "Apparel",
        currentPrice: 45,
        stockLevel: 50,
        priceHistory: [{ date: new Date("2023-06-01"), price: 50 }],
        studentBenefits: "Buy 1 Get 1 50% off",
        isAvailableInOtherNodes: false
      }
    ];

    // 8. Insert Products
    console.log(`[DEBUG] Inserting ${products.length} Products...`);
    await Product.insertMany(products);
    console.log("[DEBUG] ✔ Products Imported Successfully.");

    console.log("\n--- [SUCCESS] SEEDING COMPLETE ---");
    process.exit();

  } catch (error) {
    console.error("\n--- [FAILURE] ERROR DURING IMPORT ---");
    console.error("Error Message:", error.message);
    process.exit(1);
  }
};

// Wait a moment for DB connection to establish before running
setTimeout(() => {
    console.log("[DEBUG] Triggering import function...");
    importData();
}, 2000);