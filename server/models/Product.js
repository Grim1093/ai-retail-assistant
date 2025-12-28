// server/models/Product.js
const mongoose = require('mongoose');

console.log("Loading Product Model...");

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: String,
    currentPrice: Number,
    stockLevel: Number,
    // Track Record Feature
    priceHistory: [{ date: Date, price: Number }],
    // Student Benefits Feature
    studentBenefits: String, 
    isAvailableInOtherNodes: Boolean
});

module.exports = mongoose.model('Product', ProductSchema);