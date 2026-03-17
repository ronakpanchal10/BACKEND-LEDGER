const mongoose = require("mongoose");

async function connectToDB() {
  try {

    await mongoose.connect(process.env.MONGO_URI)

    console.log("MongoDB Connected Successfully")

  } catch (err) {

    console.error("Error connecting to DB:", err.message)

    process.exit(1)

  }
}

module.exports = connectToDB