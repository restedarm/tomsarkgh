const { Router } = require('express');
const router = Router();
const { verifyToken } = require('../middlewares/verifyToken');
const { registerValidator,loginValidator,valErrorHandler } = require('../middlewares/validator')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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


router.post('/api/users',registerValidator,async(req,res) => {
    try{
        const user = new User();
        user.email = req.body.email;

        if(await User.findOne({email: user.email})){
            return res.status(400).json({
                message: "Account with that email already exists"
            });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.country = req.body.country;
        user.username = req.body.username
    
        const savedUser = await user.save()
        const token = await jwt.sign({userId:user._id}, process.env.SECRET)
        const emailResponse = await sendEmail({to:user.email,
            text:`Please click to the link ${process.env.APP_URL}/auth/emailVerify?token=${token}`})
    // console.log('emailResponse', emailResponse)
        res.json({
            msg: "Please check your email",
            id: savedUser._id
        })
    }catch(err){
        res.json({
            msg: "Could not create user",
        })
    }
})      

 router.post('/api/login',loginValidator,async(req,res) => {
    try{
        const user = await User.findOne({email:req.body.email});
        const match = await bcrypt.compare(req.body.password, user.password);
        if(!match){
            res.json("Wrong password");
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
    }catch(error){
        res.status(401).json({
            message:"Auth failed"
        })
    }
});

router.post('/', (req,res) => {
    console.log("mtanq")
    res.json(req.body.email)
})



// token verification   
router.get('/api/profile', verifyToken, (req,res) => {
    req.user.password = undefined
    res.json(req.user);
});

router.get('/api', (req, res) => {
    res.json({message: 'Welcome to the API'});
})

module.exports = router;


