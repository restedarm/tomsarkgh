const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const verify = require('./middlewares/verifyToken');
dotenv.config();

const app = express();

mongoose.connect('mongodb://localhost/jsw_test');
const db = mongoose.connection;

// Requiring Routers
const authRouter = require('./routes/auth.route');
const ticketRouter = require('./routes/ticket.route');
const commentRouter = require('./routes/comment.route');


app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.use('/auth',authRouter);
app.use('/ticket',ticketRouter);
app.use('/comment',commentRouter);


app.listen(3000, () => {
    console.log("Server started on port 3000");
});




