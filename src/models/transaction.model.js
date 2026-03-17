const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    type:{
        type:String,
        enum:["income","expense"],
        required:true
    },

    amount:{
        type:Number,
        required:true
    },

    note:{
        type:String
    }

},{
    timestamps:true
})

const transactionModel = mongoose.model("Transaction",transactionSchema)

module.exports = transactionModel