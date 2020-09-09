const jwt = require("jsonwebtoken");
const { request, response } = require("express");
const router = require("../routes/user");
const User = require("../models/user");

const auth = async (request, response, next)=>{
    const token = request.header("x-auth-token");

    if(!token){
        console.log("token not found");
        return response.status(401).json({msg: "No authentication token found!"});
    }
    try{

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if(!verified){
            console.log("not verified");
            return response.status(401).json({msg: "Token verification failed"});
        }
        request.user = verified.id;

        const curUser = await User.findById(verified.id);
        if(!curUser){
            response.status(401).json({msg: "Account with this account doesn't exist anymore"});
        }
        next();
    }
    catch (err){
        console.log(err);
        return response.status(401).json({error: err.message});
    }
};


module.exports = auth;

