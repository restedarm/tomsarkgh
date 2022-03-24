const jwt = require('jsonwebtoken');
const Ticket = require('../models/ticket');
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
            // res.json({
            //     userId: user._id
            // })
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

async function checkTicketOwnership(req,res,next){
    try{
        const ticket = await Ticket.findById(req.params.id);
        if(ticket.author.id.toString() !== req.user._id.toString()){
            res.json({
                msg: "You dont have permission to do that"
            })
        }else{
            next();
        }
    }catch(error){
        res.json({
            msg: "Ticket not found"
        })
    }
}

  

function parse(str,ord){
    console.log("funkcia mtel enq")
    if(str === "price"){
        return { price : Number(ord)}
    }
    else if(str === "quantity"){
        return { quantity : Number(ord)}
    }
    else if(str === "cancelDate"){
        return { cancelDate : Number(ord)}
    }
    else if(str === "eventDate"){
        return { eventDate : Number(ord)}
    }
}



module.exports = {verifyToken,parse,checkTicketOwnership}
