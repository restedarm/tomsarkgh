const mongoose = require('mongoose');


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
});

const User = module.exports = mongoose.model('User', userSchema);