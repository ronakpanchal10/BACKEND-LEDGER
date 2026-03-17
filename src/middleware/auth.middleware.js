const jwt = require("jsonwebtoken")

function authMiddleware(req,res,next){

    try{

        const authHeader = req.headers.authorization

        if(!authHeader){
            return res.status(401).json({
                success:false,
                message:"Authorization header missing"
            })
        }

        if(!authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                success:false,
                message:"Invalid token format"
            })
        }

        const token = authHeader.split(" ")[1]

        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token missing"
            })
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        req.userId = decoded.userId

        next()

    }catch(err){

        if(err.name === "TokenExpiredError"){
            return res.status(401).json({
                success:false,
                message:"Token expired"
            })
        }

        if(err.name === "JsonWebTokenError"){
            return res.status(401).json({
                success:false,
                message:"Invalid token"
            })
        }

        return res.status(500).json({
            success:false,
            message:"Authentication failed"
        })

    }

}

module.exports = authMiddleware