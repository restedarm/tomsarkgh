const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const verify = require('./middlewares/verifyToken');

dotenv.config();

const app = express();

mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection;

// Requiring Routers
const authRouter = require('./routes/auth.route');
const ticketRouter = require('./routes/ticket.route');
const commentRouter = require('./routes/comment.route');
const orderRouter = require('./routes/order.route');


app.use(express.json());
app.use(express.urlencoded({extended:true}));





app.use('/auth',authRouter);
app.use('/ticket',ticketRouter);
app.use('/comment',commentRouter);
app.use('/order',orderRouter);



app.listen(process.env.PORT, () => {
    console.log("Server started on port 3000");
});




// res.setHeader('Authorization', 'Bearer '+ token); 
// res.header('Authorization', 'Bearer '+ token);