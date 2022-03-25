const { Router } = require("express");
const router = Router();
const { verifyToken, parse, checkTicketOwnership } = require('../middlewares/verifyToken');
const { ticketValidator } = require('../middlewares/validator');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/user');
const Ticket = require('../models/ticket')
const sendEmail =  require('../send-mail.js');
const mongoose = require('mongoose');
const user = require("../models/user");
dotenv.config();

//Create a ticket 
router.post('/',verifyToken,ticketValidator,async (req,res)=>{
    const ticket = req.body;
    ticket.isSold = false;

    try {
        const newTicket = await Ticket.create({...ticket, author: {id:req.user._id}});
        console.log(newTicket.owner)
        res.status(201).json(newTicket);
    } catch(error){
        res.status(409).json({message: error});
    }
})

//Delete a ticket by name

router.delete('/:id',verifyToken,checkTicketOwnership, async (req,res)=>{
    console.log("mtanq")
    if(req.body.isSold){
        return res.status(400).send('You can`t delete a sold ticket');
    }
    try{
        const { id } = req.params;
        if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).send('No product with that id');
        await Ticket.findByIdAndRemove(id);
        res.json({message :'Product deleted successfully'});
    } catch(error){
        res.status(404).send('No product with that id');
    }
});

//Edit a ticket,if sold we can`t
router.patch('/:id',verifyToken,checkTicketOwnership, async (req,res)=>{
    if(req.body.isSold){
        return res.status(400).send('You can`t change any field');
    }
    try{
        const { id } = req.params;
        const { name, description, price, eventDate, cancelDate, quantity, canCancel } = req.body;
        const ticket = req.body;

        if( name ) ticket.name = name;
        if( description ) ticket.description = description;
        if( price ) ticket.price = price;
        if( eventDate ) ticket.eventDate = eventDate;
        if( cancelDate ) ticket.cancelDate = cancelDate;
        if( quantity ) ticket.quantity = quantity;
        if( canCancel ) ticket.canCancel = canCancel;
        if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).send('No product with that id');
        await Ticket.findByIdAndUpdate(id,ticket);
        res.json({message :'Product updated successfully'});
    } catch(error){
        res.status(404).send('No product with that id');
    }
});


// Find all tickets filtered by atributes and sorted by users choice
router.get('/search',verifyToken, async (req,res)=>{ 
    
    const { page, sortOrder, sortField, ...ticketFields} = req.query
    let query;

    const LIMIT = 2;
    const startIndex = (Number(page) - 1) * 2;  
    const total = await Ticket.countDocuments({});
    
    if (!sortOrder & !sortField){
        //setting
        query = { _id:1 }
    }
    else {
        query = parse(sortField,sortOrder);
    }
    try{
        const tickets = await Ticket.find({
            ...ticketFields,
            allowedCountries: { 
                "$regex": req.user.country,
                "$options": "i" 
            }
        }).populate('comments','text').sort(query).limit(LIMIT).skip(startIndex)
        res.status(200).json({ data: tickets, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT) });
    }catch(error){
        res.json({
            msg: "not found"
        })
    }
})

//Add a ticket to shopping cart
router.patch('/:id/addToCart',verifyToken, async (req,res)=>{
    try{
       // req.user.balance = 1000;
        const { id } = req.params;
        const ticket = await Ticket.findById(id);
        if(ticket.quantity === 0){
            return res.status(400).send('No available tickets');
        }
    
        ticket.quantity -= 1;
        ticket.owner = req.user._id;
        ticket.save();

        req.user.shoppingCart.push(ticket);
        req.user.save();
        
        res.json(ticket);

    } catch(error){
        res.status(404).send('No product with that id');
    }
})

//Cancel a ticket from shopping cart
router.patch('/:id/cancelFromCart',verifyToken, async (req,res)=>{
    try{
        const { id } = req.params;
        const isFound = await User.find({ "shoppingCart": { "$in": [id] } })
        console.log(isFound)
        if(isFound.length === 0){
            return res.status(400).send('You don`t have this ticket in your shopping cart');
        }
        const ticket = await Ticket.findById(id);
        if(ticket.canCancel && ticket.cancelDate > Date.now()){      
            ticket.quantity += 1;
            ticket.save();
            
          //  req.user.balance += ticket.price;
            req.user.shoppingCart = req.user.shoppingCart.filter(item => item._id.toString() !== id);
            req.user.save();
            console.log(req.user.balance)  
            res.json(ticket);     
        }
        else{
            return res.status(400).send('You can`t cancel this ticket');
        }

    } catch(error){
        res.status(404).send('No product with that id');
    }
});

//Show shopping cart
router.get('/cart',verifyToken, async (req,res)=>{
    try{
        const shoppingCart = req.user.shoppingCart;
        res.json(shoppingCart);
    }
    catch(error){
        res.status(404).send('No product with that id');
    }
})

//Like a ticket
router.patch('/:id/like',verifyToken, async (req,res)=>{
    try{
        const { id } = req.params;
        console.log(id)
        const ticket = await Ticket.findById(id);
    
        console.log(ticket.likedBy)
        if(ticket.likedBy.includes(req.user._id)){
            return res.status(400).send('You already liked this ticket');
        }

        if(ticket.dislikedBy.includes(req.user._id)){
            ticket.dislikedBy.splice(ticket.dislikedBy.indexOf(req.user._id),1);
            ticket.dislikes -= 1;
        }

        ticket.likedBy.push(req.user._id);
        ticket.likes+=1

        ticket.save();
        res.json(ticket);
    } catch(error){
        res.status(404).send('No product with that id');
    }
});

//Dislike a ticket
router.patch('/:id/dislike',verifyToken, async (req,res)=>{
    try{
        const { id } = req.params;
        const ticket = await Ticket.findById(id);
    
        if(ticket.dislikedBy.includes(req.user._id)){
            return res.status(400).send('You already disliked this ticket');
        }
        if(ticket.likedBy.includes(req.user._id)){
            ticket.likedBy.splice(ticket.likedBy.indexOf(req.user._id),1);
            ticket.likes -= 1;
        }
        ticket.dislikedBy.push(req.user._id);
        ticket.dislikes+=1;
        ticket.save();
        res.json(ticket);
    } catch(error){
        res.status(404).send('No product with that id');
    }
});


module.exports = router;