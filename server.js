const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const verify = require('./middlewares/verifyToken');
dotenv.config();

const app = express();

mongoose.connect('mongodb://localhost/jsw_test');
const db = mongoose.connection;

//Routers
const authRouter = require('./routes/auth.route');
const ticketRouter = require('./routes/ticket.route');


//Bringin models in
// const User = require('./models/user');
// const Ticket = require('./models/ticket');

app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.use('/auth',authRouter);
app.use('/ticket',ticketRouter);




app.listen(3000, () => {
    console.log("Server started on port 3000");
});
