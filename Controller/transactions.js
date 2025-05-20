const OrderBook = require("../Model/orderBookModel");
const User = require("../Model/userModel");
const { ORDER_CATAGORY, ORDER_BOOK_STATUS } = require("../utills/constraints");

const createSellOrder = async (req, res) => {
    try {
        const { seller_id, quantity, currency, price } = req.body;

        const sellerDetails = await User.findOne({ _id: seller_id });
        if (!sellerDetails) {
            return res.status(404).send({ message: "Seller not found." });
        }

        let balanceField;

        if (currency === "ETH") {
            balanceField = "eth_balance";
            if (Number(quantity) > Number(sellerDetails.eth_balance)) {
                return res.status(400).send({ message: `You don't have sufficient ETH balance to create this sell order.` });
            }
        } else if (currency === "USD") {
            balanceField = "usd_balance";
            if (Number(quantity) > Number(sellerDetails.usd_balance)) {
                return res.status(400).send({ message: `You don't have sufficient USD balance to create this sell order.` });
            }
        } else {
            return res.status(403).send({ success: false, message: "Only USD and ETH are allowed." });
        }

        // Create the sell order
        const newSellOrder = new OrderBook({
            seller_id,
            quantity,
            currency,
            price,
            order_catagory: ORDER_CATAGORY.SELL,
            status: ORDER_BOOK_STATUS.PENDING
        });
        await newSellOrder.save();

        // Deduct balance from seller
        const newBalance = Number(sellerDetails[balanceField]) - Number(quantity);
        sellerDetails[balanceField] = newBalance.toString();
        await sellerDetails.save();

        return res.status(201).json({ success: true, message: "Sell order created successfully.", data: newSellOrder });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Error while creating sell order.", error });
    }
}

const buyOrder = async (req, res) => {
    try {
        const { orderTable_id, buyer_id } = req.body;

        // Validate order existence
        const order = await OrderBook.findOne({ _id: orderTable_id });
        if (!order) {
            return res.status(404).json({ success: false, message: "No sell order found with the given ID." });
        }

        // Check if already completed
        if (order.status === ORDER_BOOK_STATUS.COMPLETED) {
            return res.status(422).json({ success: false, message: "Order has already completed." });
        }

        // Validate buyer existence
        const buyer = await User.findById(buyer_id);
        if (!buyer) {
            return res.status(404).json({ success: false, message: "Buyer not found." });
        }

        const { currency, quantity } = order;

        // Add purchased quantity to buyer's balance
        if (currency === "ETH") {
            buyer.eth_balance = (Number(buyer.eth_balance || 0) + Number(quantity));
        } else if (currency === "USD") {
            buyer.usd_balance = (Number(buyer.usd_balance || 0) + Number(quantity));
        } else {
            return res.status(400).json({ success: false, message: "Unsupported currency type." });
        }

        // Save updated buyer balance
        await buyer.save();

        // Update order status and set buyer_id
        order.status = ORDER_BOOK_STATUS.COMPLETED;
        order.buyer_id = buyer._id;
        await order.save();

        return res.status(200).json({ success: true, message: "Buy order executed successfully.", data: order });
    } catch (error) {
        console.error("Buy order error:", error);
        return res.status(500).json({ success: false, message: "Internal server error.", error });
    }
};

const fetchPendingOrders = async (req, res) => {
    try {
        const allData = await OrderBook.find({ status: ORDER_BOOK_STATUS.PENDING });
        return res.status(200).json({ success: true, message: "Order list fetched successfully.", data: allData });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Server error while fetching orders list.", error });
    }
}

module.exports = {
    buyOrder,
    createSellOrder,
    fetchPendingOrders,
}