const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.routes")
const transactionRouter = require("./routes/transaction.routes")
const bankingRoutes = require("./routes/banking.routes")


const app = express()

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",authRouter)
app.use("/api/transaction",transactionRouter)
app.use("/api/bank",bankingRoutes)

module.exports = app