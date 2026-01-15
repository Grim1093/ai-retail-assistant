const mongoose = require("mongoose");

const ShiftReportSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, default: Date.now },
  
  // What the system thinks (Hidden from user during input)
  expectedCash: { type: Number, required: true },
  
  // What the user counted
  actualCash: { type: Number, required: true },
  
  // The difference
  discrepancy: { type: Number, required: true },
  
  // Audit Status
  status: { 
    type: String, 
    enum: ["Matched", "Minor Discrepancy", "CRITICAL ALERT"], 
    default: "Matched" 
  }
});

module.exports = mongoose.model("ShiftReport", ShiftReportSchema);