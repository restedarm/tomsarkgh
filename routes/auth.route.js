const { Router } = require('express');
const router = Router();
const { verifyToken } = require('../middlewares/verifyToken');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/user');
const sendEmail =  require('../send-mail.js');
dotenv.config();


router.get('/api', (req,res) => {
    res.json({ 
        message:"Welcome to the API"
    })
})

router.get('/emailVerify', async (req,res)=>{
    console.log('token is', req.query.token)
    const {userId} = await jwt.verify(req.query.token,process.env.SECRET);
    await User.updateOne({_id:userId},{verified: true})
    res.json({
        message: "Account Verified"
    });
});


router.post('/api/users',async(req,res) => {
    const user = new User();
    user.email = req.body.email;
    user.password = req.body.password;
    user.country = req.body.country;
    console.log(user)
    const savedUser = await user.save()
    const token = await jwt.sign({userId:user._id}, process.env.SECRET)
    const emailResponse = await sendEmail({to:user.email,
        text:`Please click to the link http://localhost:3000/auth/emailVerify?token=${token}`})
    console.log('emailResponse', emailResponse)
    res.json({
        msg: "Please check your email",
        id: savedUser._id
    })
})

 router.post('/api/login',async(req,res) => {
    const user = await User.findOne({email:req.body.email,password:req.body.password});
    if(!user){
        return res.status(401).json({
            message:"Auth failed"
        })
    }
    if(!user.verified){
        res.status(401).json({
            message:"User is not verified"
        })
    }
    const token = await jwt.sign({userId: user._id}, process.env.SECRET, {expiresIn: '1h'});
    res.json({
        token: token
    })

});




// token verification   
router.get('/api/profile', verifyToken, (req,res) => {
    req.user.password = undefined
    res.json(req.user);
});

module.exports = router;


