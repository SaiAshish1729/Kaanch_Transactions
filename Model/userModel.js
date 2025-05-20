const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "provide name"]
    },
    eth_balance: {
        type: String,
    },
    usd_balance: {
        type: String,
    },

}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema);

module.exports = User