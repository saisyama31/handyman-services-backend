const mongoose= require('mongoose')
const validator= require('validator')
// Date, Time, First line, City, State, Pin, Service type, Phone no

const taskschema= new mongoose.Schema({
name: {
    type: String,
    required: true
},
description: {
    type : String,
    required: true
},
date: {
    type: Date,
    required : true
},
time: {
    type: String,
    required: true
},
address:{
    type:String,
    required: true
},
city:{
    type:String,
    required: true
},
state:{
    type:String,
    required: true
},
pincode:{
    type:Number,
    minlength:6,
    maxlength:6,
    required: true
},
servicetype:{
    type:String,
    required: true
},
phnumber:{
    type: Number,
    required:true,
    maxlength:10,
    minlength:10

},   
owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
}
},{
    timestamps: true
})
//task model
const Task= mongoose.model('Task',taskschema)

module.exports= Task