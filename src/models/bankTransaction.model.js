const mongoose = require("mongoose");

const bankTransactionSchema = new mongoose.Schema({

    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Account"
    },

    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Account"
    },

    amount:{
        type:Number,
        required:true
    },

    type:{
        type:String,
        enum:["deposit","withdraw","transfer"],
        required:true
    }
},{timestamps:true})

module.exports = mongoose.model("BankTransaction",bankTransactionSchema)