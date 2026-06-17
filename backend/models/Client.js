const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: String,
  profession: String,
  active: { type: Boolean, default: true },
  interest: String,
  message: String,
}, { timestamps: true });

module.exports = mongoose.model("Client", clientSchema);
