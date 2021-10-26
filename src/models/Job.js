const mongoose = require("mongoose");
const { Schema } = mongoose;

const JobSchema = new Schema({
  name: { type: String, required: true },
  telf: { type: Number, required: true },
  description: { type: String, required: true },
  precio: { type: Number, required: true },
  urgencia: { type: String, required: true },
  date: { type: Date, default: Date.now },
  estado: { type: String, default: "false" },
  entregado: { type: String, default: "false" },
  dni: { type: Number, default: "0" },
  modelo: { type: String, required: true },
  trabajador: { type: String, required: true },
  user: { type: String },
});

module.exports = mongoose.model("Tarea", JobSchema);
