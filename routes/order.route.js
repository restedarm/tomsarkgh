const { Router } = require('express');
const router = Router();
const { verifyToken } = require('../middlewares/verifyToken');
const dotenv = require('dotenv');

const Order = require('../models/order');
const Ticket = require('../models/ticket');

dotenv.config();


//Make an order
router.post('/', verifyToken, async (req, res) => {
    const tickets = req.user.shoppingCart;
    const order = new Order();
    order.tickets = tickets;
    order.owner = req.user.id;
    console.log(tickets);
    order.save()

    let tick
    let price=0;
    for (let i = 0; i < tickets.length; i++) {
        tick = await Ticket.findById(tickets[i]._id);
        console.log(tick.price + " ticket price ")
        price += tick.price;
    }
    console.log(price);
    if (price > req.user.balance) {
        return res.status(400).send('You don`t have enough money');
    }
    console.log(typeof(req.user.balance))
    req.user.balance -= price;
    req.user.orders.push(order);
    req.user.shoppingCart = [];
    req.user.save();

    res.json(order)
});
 
//Get my orders
router.get('/', verifyToken, async (req,res) => {
    const { page } = req.query || 1;
    try{
        const LIMIT = 2;
        const startIndex = (Number(page) - 1) * 2;  
        const total = await Order.countDocuments({});

        const orders = await Order.find({owner : req.user._id})
        .populate('tickets','name').limit(LIMIT).skip(startIndex)
            res.status(200).json({ data: orders, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT) });
    }catch(error){
        res.json({
            msg: "not found"
        })
    }
})


//Cancel an order
router.patch('/:id/cancel',verifyToken, async (req,res)=>{
    try{
        const { id } = req.params;
        let price;
        const order = await Order.findById(id);

        if(order.owner.toString() !== req.user._id.toString()){
            return res.status(400).send('You don`t have this order');
        }
        for(let i = 0; i < order.tickets.length; i++){
            var ticket = await Ticket.findById(order.tickets[i]._id);
            if(ticket.canCancel && ticket.cancelDate > Date.now()){      
                ticket.quantity += 1;
                price += ticket.price;
            }
            
            else{
                return res.status(400).send('You can`t cancel this ticket');
            }
            ticket.save();
        }
        
        req.user.balance += ticket.price;
        req.user.save();
        order.remove();
        res.json(order);
    } catch(error){
        res.status(404).send('No product with that id');
    }
})

module.exports = router;