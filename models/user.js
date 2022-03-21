const mongoose = require('mongoose');

// User Schema
const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean
    },
    balance: {
        type: Number,
        default: 1000
    },
    country: {
        type: String,
       // required: true
    },
    shoppingCart: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
        }
    ],
    // order: {
    //     type: Array,
    //     default: []
    // }
});

const User = module.exports = mongoose.model('User', userSchema);