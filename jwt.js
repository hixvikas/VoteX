const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {

    //first check request headers has authorization or not 
    const authorization = req.headers.authorization
    if(!authorization) return res.status(401).json({error: "Token not found"});

    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({error: "Unauthorized"});


    try {
        // verify the jwt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        
        // Attach user information to the request object
        req.user = decoded     // we can put anything at user like userEncodedData etc..
        next();
    
    } catch (error) {
        console.error(err);
        res.status(401).json({error: "Invalid token"});
    }
}

// function to generate JWT token

const generateToken = (userData) => {
    // generate a new JWT token using user data

    return jwt.sign(userData, process.env.JWT_SECRET);   // we can put expiry time also , {expiresIn: 300000000}
}

module.exports = {jwtAuthMiddleware, generateToken}