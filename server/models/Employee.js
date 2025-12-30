const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  itemsSold: Number,
  totalSalesValue: Number,
  profitGenerated: Number,
  avgDiscount: Number,
  rating: String,
  nodeLocation: { type: String, default: "Main Counter" }
});

module.exports = mongoose.model("Employee", EmployeeSchema);
