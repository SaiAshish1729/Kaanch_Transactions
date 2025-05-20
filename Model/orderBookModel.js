const mongoose = require("mongoose");

const orderBookSchema = new mongoose.Schema({
    buyer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    currency: {
        type: String
    },
    quantity: {
        type: String
    },
    price: {
        type: String
    },
    status: {
        type: String,
        required: true
    },
    order_catagory: {
        type: String,
        required: true,
    }

}, {
    timestamps: true
});

const OrderBook = mongoose.model('orderBook', orderBookSchema);

module.exports = OrderBook