const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('../jwt')


router.post('/signup',async (req, res) =>{
   try{
    const data = req.body;

    const newUser = new User(data);

    const response = await newUser.save();   //await is wait until the async operation is completed//

    console.log('User saved');

    const payload = {
        id: response.id,
    }

    console.log(JSON.stringify(payload))

    const token = generateToken(payload);    //we can also put single values like response.username at payload
    console.log("token is: ", token)

    res.status(200).json({response: response, token : token})
   }
   catch(err){
    console.log(err);
    res.status(500).json({error: 'internal server error'});
   }
})

router.post('/login', async(req, res) => {
    try {
        // extract username and password from request body
        const {aadharCardNumber, password} = req.body;

        // find the user by aadharCardNumber
        const user = await Person.findOne({aadharCardNumber: aadharCardNumber});

        // if user does not exit or password does not match, return error
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error: "Invalid aadharCard Number or password"});
        }


        //generate token if user username and password is true

        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        // return token as response
        res.json({token})
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})

router.get('/profile', jwtAuthMiddleware, async(req, res) => {
    try {
        const userData = req.user;

        const userId = userData.id;
        const user = await User.findById(userId)

        res.status(200).json({user});
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"}) 
    }
})



router.put('/profile/password', async(req, res) => {
    try {
        const userId = req.user;    // extract the user id from the jwt token
        const {currentPassword, newPassword} = req.body;   // extract the current and new password from the request body 

        // find the user by userid
        const user = await User.findById(userId)
        
        // if password does not match, return error
         if(!user || !(await user.comparePassword(currentPassword))){
            return res.status(401).json({error: "Invalid aadharCard Number or password"});
        }

        // alter all update the current user password 
        user.password = newPassword;
        await user.save();

        console.log("Your password is updated successfully");
        res.status(200).json({message: "Password Updated"});

    } catch (error) {
        console.log(error)
        res.status(500).json({error: "internal server error"})
    }
})


module.exports = router;