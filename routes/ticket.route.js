const { Router } = require("express");
const router = Router();
const verifyToken = require('../middlewares/verifyToken');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/user');
const Ticket = require('../models/ticket')
const sendEmail =  require('../send-mail.js');
const mongoose = require('mongoose');
dotenv.config();

//Create a ticket 
router.post('/',verifyToken,async (req,res)=>{
    const ticket = req.body;

    try {
        const newTicket = await Ticket.create({...ticket});
        res.status(201).json(newTicket);
    } catch(error){
        res.status(409).json({message: error});
    }
})

//Delete a ticket by name

router.delete('/:id',verifyToken, async (req,res)=>{
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

router.patch('/:id',verifyToken, async (req,res)=>{
    const { id } = req.params;
    const ticket = req.body;

    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).send('No product with that id');
    const updatedTicket = await Ticket.findByIdAndUpdate(id, { ...ticket, _id: id }, { new: true });
    res.json(updatedTicket);
})

// Get All tickets
//  router.get('/tickets'),async (req, res) => {
//     const { page } = req.query;
//     try {
//         const LIMIT = 8;
//         const startIndex = (Number(page) - 1) * 8;  // get the starting index of every page
//         const total = await Product.countDocuments({});

//         const products = await Product.find().sort({ id: -1}).limit(LIMIT).skip(startIndex);  // sort from newest to the oldest

//         res.status(200).json({ data: products, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT) });
        
//     } catch (error) {
//         res.status(404).json({ message: error.message });
//     }
// };


//Get tickets by search
router.get('/search', async (req,res)=>{
    const { searchQuery } = req.query;
    try{
        const tickets = await Ticket.find({searchQuery})
        res.json(tickets);
    }catch(error){
        res.json({
            msg: "not found"
        })
    }
})

module.exports = router;