const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const authRouter = require('./routes/auth.route');
const verify = require('./middlewares/verifyToken');
dotenv.config();

const app = express();

mongoose.connect('mongodb://localhost/jsw_test');
const db = mongoose.connection;

const User = require('./models/user');

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/auth',authRouter);


app.listen(3000, () => {
    console.log("Server started on port 3000");
});
