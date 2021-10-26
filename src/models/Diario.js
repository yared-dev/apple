const mongoose = require("mongoose");
const { Schema } = mongoose;
const DiarioSchema = new Schema({
     precio:{type:Number,require:true},
     date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Diario", DiarioSchema);
