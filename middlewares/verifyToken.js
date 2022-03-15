const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function verifyToken(req,res,next){
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        try{
            const {userId} = await jwt.verify(bearerToken, process.env.SECRET);
            const user = await User.findById(userId).exec();
            req.user = user
            next();
        }catch(err){
            res.json({
                msg: "Account is not logged in"
            })
        }
    }else{
        res.sendStatus(403);
    }
}

module.exports = verifyToken;
