const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const sendEmail = require("../utils/sendEmail")
const generateOTP = require("../utils/generateOTP")


// REGISTER
async function userRegisterController(req,res){

    try{

        const {email,password,name} = req.body

        if(!email || !password || !name){
            return res.status(400).json({
                message:"All fields required"
            })
        }

        const isExists = await userModel.findOne({email})

        if(isExists){
            return res.status(422).json({
                message:"User already exists"
            })
        }

        // GENERATE OTP
        const otp = generateOTP()

        const user = await userModel.create({
            email,
            password,
            name,
            otp,
            otpExpiry: Date.now() + 5 * 60 * 1000 // 5 minutes
        })

        // SEND OTP EMAIL
        await sendEmail(
            email,
            "Email Verification OTP",
            `Hello ${name}, your OTP is ${otp}. It will expire in 5 minutes.`
        )

        res.status(201).json({
            message:"OTP sent to your email. Please verify your account."
        })

    }catch(error){

        console.log(error)

        res.status(500).json({
            message:"Server Error"
        })

    }

}

async function verifyOTPController(req,res){

    try{

        const {email,otp} = req.body

        const user = await userModel.findOne({email})

        if(!user){
            return res.status(404).json({
                message:"User not found"
            })
        }

        if(user.otp !== otp){
            return res.status(400).json({
                message:"Invalid OTP"
            })
        }

        if(user.otpExpiry < Date.now()){
            return res.status(400).json({
                message:"OTP expired"
            })
        }

        user.isVerified = true
        user.otp = null
        user.otpExpiry = null

        await user.save()

        await sendEmail(
            user.email,
            "Welcome to Ledger App !",
            `Hello ${user.name}, your email has been verified successfully. Welcome to Ledger App !`
        )

        res.json({
            message:"Email verified successfully"
        })

    }catch(error){

        res.status(500).json({
            message:"Server error"
        })
    }

}

// LOGIN
async function userLoginController(req, res) {

    try {

        const { email, password } = req.body

        const user = await userModel
            .findOne({ email })
            .select("+password")

        if (!user) {
            return res.status(401).json({
                message: "Email or Password is Invalid"
            })
        }

        const isValidPassword = await user.comparePassword(password)

        if (!isValidPassword) {
            return res.status(401).json({
                message: "Email or Password is Invalid"
            })
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            sameSite:"strict"
        })

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        })

    } catch (error) {

        console.log(error)

        res.status(500).json({
            message: "Server Error"
        })

    }

}


// GET CURRENT USER
async function getUserController(req, res) {

    try {

        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.userId)

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            user
        })

    } catch (error) {

        res.status(401).json({
            message: "Invalid token"
        })

    }

}


// LOGOUT
function logoutController(req, res) {

    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict"
    })

    res.status(200).json({
        message: "Logged out successfully"
    })

}

module.exports = {
    userRegisterController,
    verifyOTPController,
    userLoginController,
    getUserController,
    logoutController
}