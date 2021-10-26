const mongoose = require("mongoose");
const { Schema } = mongoose;

const DescSchema = new Schema({
     description:{type:String,require:true},
     precio:{type:Number,require:true},
     tID:{type:String,require:true},
     date: { type: Date, default: Date.now },

});

module.exports = mongoose.model("Descuento", DescSchema);
