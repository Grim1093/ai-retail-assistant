const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  currentPrice: Number,
  stockLevel: Number,

  // Track record (past prices)
  priceHistory: [
    {
      date: Date,
      price: Number
    }
  ],

  // Student benefits / offers
  studentBenefits: String,

  // Multi-node availability
  isAvailableInOtherNodes: Boolean
});

module.exports = mongoose.model("Product", ProductSchema);
