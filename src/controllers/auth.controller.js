const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const sendEmail = require("../services/sendEmail")
const generateOTP = require("../services/generateOTP")


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

        await userModel.create({
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

        console.log(error);
        

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
                message: "Password is Invalid"
            })
        }

        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
        )

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        )

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite:"strict",
            secure: false
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite:"strict",
            secure: false
        })

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            accessToken
        })

    } catch (error) {

        console.log(error)

        res.status(500).json({
            message: "Server Error"
        })

    }

}

async function refreshTokenController(req, res) {

    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({ message: "No refresh token" });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await userModel
            .findById(decoded.userId)
            .select("+refreshToken");

        console.log("COOKIE:", token);
        console.log("DB:", user?.refreshToken);

        if (!user || user.refreshToken !== token) {
            return res.status(403).json({
                message: "Invalid refresh token"
            });
        }

        const newAccessToken = jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        const newRefreshToken = jwt.sign(
            { userId: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: false
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: false
        });

        res.status(200).json({
            accessToken: newAccessToken
        });

    } catch (err) {

        return res.status(403).json({
            message: "Invalid or expired refresh token"
        });

    }
}


// GET CURRENT USER
async function getUserController(req, res) {

    try {

        const token = req.cookies.accessToken

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

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

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({
        message: "Logged out successfully"
    })

}

module.exports = {
    userRegisterController,
    verifyOTPController,
    userLoginController,
    refreshTokenController,
    getUserController,
    logoutController
}