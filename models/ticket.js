const mongoose = require('mongoose');

// User Schema
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        //required: true
    },
    eventDate: {
        type: Date,
        //required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    canCancel: {
        type: Boolean,
        default: true
    },
    cancelDate: {
        type: Date,
        required: true
    },
    allowedCountries: {
        type: String,
        //required: true
    },
    isSold: {
        type: Boolean
    },
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
        },
       // username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        },
    ],
    
});

const Ticket = module.exports = mongoose.model('Ticket', userSchema);