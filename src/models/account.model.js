const mongoose = require("mongoose");

const accountShema = new mongoose.Schema({
        user:{
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true
        },
        accountNumber: {
            type: String,
            unique: true,
            required: true
        },
        balance:{
            type : Number,
            default : 0
        }
    },{
        timestamps : true
});

module.exports = mongoose.model("Account",accountShema);