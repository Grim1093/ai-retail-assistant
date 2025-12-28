const dotenv = require("dotenv");
const mongoose = require('mongoose'); 
const Employee = require("./models/Employee");
const Product = require("./models/Product");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // Clear old data
    await Employee.deleteMany();
    await Product.deleteMany();
    console.log("Old data removed");

    // Employees data
    const employees = [
      {
        name: "Employee A",
        itemsSold: 156,
        totalSalesValue: 4680,
        profitGenerated: 1404,
        avgDiscount: 8,
        rating: "Excellent"
      },
      {
        name: "Employee B",
        itemsSold: 142,
        totalSalesValue: 4260,
        profitGenerated: 1278,
        avgDiscount: 10,
        rating: "Very Good"
      },
      {
        name: "Employee C",
        itemsSold: 128,
        totalSalesValue: 3840,
        profitGenerated: 1152,
        avgDiscount: 12,
        rating: "Good"
      },
      {
        name: "Employee D",
        itemsSold: 119,
        totalSalesValue: 3570,
        profitGenerated: 1071,
        avgDiscount: 15,
        rating: "Satisfactory"
      },
      {
        name: "Employee E",
        itemsSold: 105,
        totalSalesValue: 3150,
        profitGenerated: 945,
        avgDiscount: 18,
        rating: "Needs Improvement"
      }
    ];

    await Employee.insertMany(employees);
    console.log("Employees data imported");

    // Products data
    const products = [
      {
        name: "Wireless Headphones",
        category: "Electronics",
        currentPrice: 150,
        stockLevel: 12,
        priceHistory: [
          { date: new Date("2023-01-01"), price: 160 }
        ],
        studentBenefits: "15% off with Valid ID",
        isAvailableInOtherNodes: true
      },
      {
        name: "University Hoodie",
        category: "Apparel",
        currentPrice: 45,
        stockLevel: 50,
        priceHistory: [
          { date: new Date("2023-06-01"), price: 50 }
        ],
        studentBenefits: "Buy 1 Get 1 50% off",
        isAvailableInOtherNodes: false
      }
    ];

    await Product.insertMany(products);
    console.log("Products data imported");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importData();

