const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  model: String,
  fabric: String,
  status: { type: String, default: "Em andamento" },
  openedAt: String,
});

module.exports = mongoose.model("Order", orderSchema);
