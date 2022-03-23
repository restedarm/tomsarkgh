const { Router } = require('express');
const router = Router();
const { verifyToken } = require('../middlewares/verifyToken');
const dotenv = require('dotenv');

const Ticket = require('../models/ticket');
const Comment = require('../models/comment');

dotenv.config();

//Get tickets comments
router.get('/:id', async (req,res)=>{
    try{
        const ticket = await Ticket.findById(req.params.id).populate('comments');
        res.json(ticket);
    }
    catch(error){
        res.status(404).send('No ticket with that id');
    }
})

//Create a comment on a ticket
router.post('/:id', verifyToken, async (req, res) => {
    const {comment} = req.body;
    try{
        const ticket = await Ticket.findById(req.params.id);
        //res.json(ticket)
    //Create a comment
        const comment = new Comment();
        comment.text = req.body.comment;
        comment.author.id = req.user._id;
        comment.save()

        ticket.comments.push(comment);
        ticket.save();
        
        res.json(comment);
    }catch(error){
         msg: "Something went wrong"
     }
    console.log("tochni")
    
});


    


module.exports = router;