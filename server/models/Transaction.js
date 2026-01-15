const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  
  // Who performed the sale? (Linked to Employee Stats)
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },

  // What did they sell?
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String, // Snapshot of name (in case product name changes later)
      quantity: { type: Number, required: true },
      priceAtSale: { type: Number, required: true }, // Snapshot of price (crucial for historical finance accuracy)
      subtotal: Number
    }
  ],

  // Financial Totals
  totalAmount: {
    type: Number,
    required: true
  },
  
  paymentMethod: {
    type: String,
    enum: ["Cash", "Card", "UPI"],
    default: "Cash"
  },

  // --- BLOCKCHAIN SIMULATION ---
  // The cryptographic proof of this transaction
  transactionHash: {
    type: String,
    // required: true // We will generate this in the controller
  },
  // The link to the previous transaction (creating the chain)
  previousHash: {
    type: String,
    default: "0" // Genesis block default
  }
});

module.exports = mongoose.model("Transaction", TransactionSchema);