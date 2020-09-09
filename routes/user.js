const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const auth = require("../middleware/auth");

const User = require("../models/user")

router.get("/", auth, async (request, response, next)=>{
    const user = await User.findById(request.user);
    response.json({
        name: user.name,
        id: user._id,
        email: user.email
    });
});


router.post('/register', async (request, response, next)=>{
    try{

        let {email, password: password, passwordCheck, name} = request.body;
        
        // validation
        if(!email || !password || !passwordCheck){
            return response.status(400).json({msg: "Not all fields are entered"}); 
        }
        if(password.toString().length < MIN_PASS_LEN){
            return response.status(400).json({msg: "Password length should be greater than "+ MIN_PASS_LEN +" characters"});
        }
        if(password !== passwordCheck){
            return response.status(400).json({msg: "Passwords do not match"});
        }

        const existingUser = await User.find({email: email});
        if(existingUser.length>0){
            return response.status(400).json({msg: "User with this email already exists!"});
        }

        if(!name){
            name = email;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log(passwordHash);

        const newUser = new User({
            email: email,
            password: passwordHash,
            name: name
        });

        const savedUser = await newUser.save();
        response.json(savedUser);

    }catch (err){
        response.status(500).json({error: err.message});
    }

});

router.post('/login', async (request, response, next)=>{
    try {
        const {email, password} = request.body;

        if(!email || !password){
            return response.status(400).json({msg: "Not all fields are entered"});             
        }

        const user = await User.findOne({email: email}).exec();
        if(!user){
            response.status(404).json({msg: "Account with this email doesn't exists"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            response.status(400).json({msg: "Invalid password"});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);

        return response.json({
            token, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        response.status(500).json({error: err.message});
    }
});

router.delete('/delete', auth, async (request, response, next)=>{
    // console.log(request.user, "verified");
    try {
        const deletedUser = await User.findByIdAndDelete(request.user);
        // if(deletedUser == null){
        //     return response.status(404).sta
        // }
        return response.json(deletedUser);
    } catch (err) {
        return response.status(500).json({error: error.message});
    }
});

router.post("/istokenvalid", async (request, response, next) => {
   try {
    //    console.log("received token req");
    const token = request.header("x-auth-token");
    // console.log(token);

    if(!token){
        return response.json(false);
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if(!verified){
        return response.json(false);
    }
    const user = await User.findById(verified.id);
    // console.log(user);
    if(!user){
        return response.json(false);
    }

    return response.json(true);
   } catch (err) {
       return response.status(500).json({error: err.message});
   } 
});

module.exports = router;