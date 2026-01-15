const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["manager", "staff"],
    default: "staff"
  },
  name: {
    type: String,
    required: true
  },
  // --- NEW FIELD: Link to Employee Stats ---
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null // Managers/Admins might not have a sales profile
  }
});

module.exports = mongoose.model("User", UserSchema);