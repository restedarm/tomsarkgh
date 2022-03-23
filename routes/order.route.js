const { Router } = require('express');
const router = Router();
const { verifyToken } = require('../middlewares/verifyToken');
const dotenv = require('dotenv');

const Order = require('../models/order');
const Ticket = require('../models/ticket');
const Comment = require('../models/comment');
const order = require('../models/order');
const res = require('express/lib/response');

dotenv.config();


//Make an order
router.post('/', verifyToken, async (req, res) => {
    const tickets = req.user.shoppingCart;
    const order = new Order();
    order.tickets = tickets;
    order.owner = req.user.id;
    order.save()

    let price;
    for (let i = 0; i < tickets.length; i++) {
        price += tickets[i].price;
    }
    if (price > req.user.balance) {
        return res.status(400).send('You don`t have enough money');
    }

    req.user.balance -= price;
    req.user.orders.push(order);
    req.user.shoppingCart = [];
    req.user.save();

    res.json(order)
});
 
//Get my orders
router.get('/', verifyToken, async (req,res) => {
    const orders = await Order.find({owner : req.user._id})
    console.log(orders)
    res.json(orders)
})


//Cancel an order
router.patch('/:id/cancel',verifyToken, async (req,res)=>{
    try{
        const { id } = req.params;
        const order = await Order.findById(id);
        if(order.owner.toString() !== req.user._id.toString()){
            return res.status(400).send('You don`t have this order');
        }
        if(order.cancelDate > Date.now()){
            return res.status(400).send('You can`t cancel this order');
        }
        order.cancelDate = Date.now();
        order.save();
        res.json(order);
    } catch(error){
        res.status(404).send('No product with that id');
    }
})

module.exports = router;