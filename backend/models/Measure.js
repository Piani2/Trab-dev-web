const mongoose = require("mongoose");

const measureSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  torax: Number,
  ombro: Number,
  cintura: Number,
  braco: Number,
});

module.exports = mongoose.model("Measure", measureSchema);
