const mongoose = require("mongoose");
const { Schema } = mongoose;

const EmpleadosSchema = new Schema({
  trabajador: { type: String, require: true },
  pagoMensual: { type: Number, default: 900 },
  pagoDefaultMensual: { type: Number },
  date: { type: Date, default: Date.now },
  fechaSgtPago: { type: Date },
  user: { type: String },
});

module.exports = mongoose.model("Empleados", EmpleadosSchema);
