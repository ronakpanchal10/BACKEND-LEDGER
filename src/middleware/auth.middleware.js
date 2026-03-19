const jwt = require("jsonwebtoken")

function authMiddleware(req,res,next){

    try{

        const authHeader = req.headers.authorization;

        let token;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
        if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token missing"
            })
        }

        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        req.userId = decoded.userId

        next()

    }catch(err){

        if(err.name === "TokenExpiredError"){
            return res.status(401).json({
                success:false,
                message:"Access Token expired"
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