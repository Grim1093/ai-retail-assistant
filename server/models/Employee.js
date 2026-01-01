const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  itemsSold: Number,
  totalSalesValue: Number,
  profitGenerated: Number,
  avgDiscount: Number,
  rating: String,

  // Phase 2: Store / Node filter support
  nodeLocation: {
    type: String,
    required: true,
    enum: ["Main Counter", "Campus Store", "Kiosk A"],
    default: "Main Counter"
  }
});

module.exports = mongoose.model("Employee", EmployeeSchema);

