const mongoose = require("mongoose");
const { Schema } = mongoose;
const PaySchema = new Schema({
  trabajador: { type: String, required: false },
  description: { type: String, required: true },
  precio: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Pay", PaySchema);
