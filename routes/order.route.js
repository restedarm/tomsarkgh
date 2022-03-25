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
    order.save()
    const dbTickets = await Ticket.find({ "_id": { "$in": tickets.map(t => t._id) } });
    const price = dbTickets.reduce((acc, ticket) => acc + ticket.price, 0);
    if (price > req.user.balance) {
        return res.status(400).send('You don`t have enough money');
    }
    const savePromises = dbTickets.map(t => {
        t.isSold = true;
        return t.save()
    })
    await Promise.all(savePromises)
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
        const dbTickets = await Ticket.find({ "_id": { "$in": order.tickets.map(t => t._id) } });
        const activeTickets = dbTickets.filter(ticket => ticket.canCancel && ticket.cancelDate > Date.now())
        order.tickets = dbTickets.filter(ticket => !ticket.canCancel || !ticket.cancelDate > Date.now())
        
        if(activeTickets.length === 0){
            return res.status(400).send('You can`t cancel this order');
        }
        
        price = activeTickets.reduce((acc, ticket) => acc + ticket.price, 0);
        const savePromises = dbTickets.map(t => {
            t.quantity += 1;
            t.isSold = false;
            return t.save()
        })
        await Promise.all(savePromises)
        req.user.balance += price;
        req.user.save();
        
        if(order.tickets.length === 0){
            await order.remove();
        }else{
            order.save();
        }
        res.json(order);
    } catch(error){
        res.status(404).send('No product with that id');
    }
})

module.exports = router;