const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: [true, "Email is Required"],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid Email"],
        unique: true
    },

    name: {
        type: String,
        required: [true, "Name is Required"]
    },

    password: {
        type: String,
        required: [true, "Password is Required"],
        minlength: [6, "Minimum length 6"],
        select: false
    },

    isVerified:{
        type:Boolean,
        default:false
    },

    otp:{
        type:String
    },

    otpExpiry:{
        type:Date
    }

},{
    timestamps:true
})


// HASH PASSWORD
userSchema.pre("save", async function(){

    if(!this.isModified("password")) 
        
        return this.password = await bcrypt.hash(this.password,10)

})


// COMPARE PASSWORD
userSchema.methods.comparePassword = async function(password){

    return await bcrypt.compare(password,this.password)

}

module.exports = mongoose.model("User",userSchema)