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
    coins: {
        type: Number,
        default: 1000
    },
    country: {
        type: String,
        required: true
    },
    shoppingCard: {
        type: Array,
        default: []
    },
    order: {
        type: Array,
        default: []
    }
});

const User = module.exports = mongoose.model('User', userSchema);