const mongoose =require('mongoose');
const {Schema}=mongoose;

const ArticulosSchema= new Schema({
	title:{type:String,require:true},
	description:{type:String,require:true},
	precio:{type:String,require:true},
	user:{type:String},
	cant:{type:Number,default:0,require:true},
	note:{type:String}
})

module.exports=mongoose.model('Articulo',ArticulosSchema);
