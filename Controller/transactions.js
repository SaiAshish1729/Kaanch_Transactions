const OrderBook = require("../Model/orderBookModel");
const User = require("../Model/userModel");
const { ORDER_CATAGORY, ORDER_BOOK_STATUS } = require("../utills/constraints");

const createOrder = async (req, res) => {
    try {
        const { user_id, quantity, currency, price, order_catagory } = req.body;

        const userDetails = await User.findOne({ _id: user_id });
        if (!userDetails) {
            return res.status(404).send({ message: "User not found." });
        }
        let balanceField;

        if (order_catagory == ORDER_CATAGORY.SELL) {
            if (currency === "ETH") {
                balanceField = "eth_balance";
                if (Number(quantity) > Number(userDetails.eth_balance)) {
                    return res.status(400).send({ message: `You don't have sufficient ETH balance to create this sell order.` });
                }
            } else if (currency === "USD") {
                balanceField = "usd_balance";
                if (Number(quantity) > Number(userDetails.usd_balance)) {
                    return res.status(400).send({ message: `You don't have sufficient USD balance to create this sell order.` });
                }
            } else {
                return res.status(403).send({ success: false, message: "Only USD and ETH are allowed." });
            }

            // Create the sell order
            const newSellOrder = new OrderBook({
                seller_id: user_id,
                quantity,
                currency,
                price,
                order_catagory: ORDER_CATAGORY.SELL,
                status: ORDER_BOOK_STATUS.PENDING
            });
            await newSellOrder.save();

            // Deduct balance from seller
            const newBalance = Number(userDetails[balanceField]) - Number(quantity);
            userDetails[balanceField] = newBalance.toString();
            await userDetails.save();
            return res.status(201).json({ success: true, message: "Sell order created successfully.", data: newSellOrder });

        } else if (order_catagory == ORDER_CATAGORY.BUY) {
            const newPurchaseOrder = await OrderBook({
                buyer_id: user_id,
                quantity,
                currency,
                price,
                order_catagory: ORDER_CATAGORY.BUY,
                status: ORDER_BOOK_STATUS.PENDING
            });
            await newPurchaseOrder.save();
            return res.status(201).json({ success: true, message: "Purchase order created successfully.", data: newPurchaseOrder });
        } else {
            if (!order_catagory) {
                return res.status(400).send({ message: "order_catagory is required." })
            }
            return res.status(403).send({ message: `order_catagory mus be ${ORDER_CATAGORY.BUY} or ${ORDER_CATAGORY.SELL}` });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Error while creating sell order.", error });
    }
}

// const buyOrder = async (req, res) => {
//     try {
//         const { orderTable_id, buyer_id } = req.body;

//         // Validate order existence
//         const order = await OrderBook.findOne({ _id: orderTable_id });
//         if (!order) {
//             return res.status(404).json({ success: false, message: "No sell order found with the given ID." });
//         }

//         // Check if already completed
//         if (order.status === ORDER_BOOK_STATUS.COMPLETED) {
//             return res.status(422).json({ success: false, message: "Order has already completed." });
//         }

//         // Validate buyer existence
//         const buyer = await User.findById(buyer_id);
//         if (!buyer) {
//             return res.status(404).json({ success: false, message: "Buyer not found." });
//         }

//         const { currency } = order;
//         const { quantity } = req.body;
//         if (!quantity) {
//             return res.status(400).json({ message: "quantity is required." });
//         } else if (quantity > order.quantity) {
//             return res.status(400).json({ success: false, message: `Available quantity is ${order.quantity}` })
//         }

//         // Add purchased quantity to buyer's balance
//         if (currency === "ETH") {
//             buyer.eth_balance = (Number(buyer.eth_balance || 0) + Number(quantity));
//         } else if (currency === "USD") {
//             buyer.usd_balance = (Number(buyer.usd_balance || 0) + Number(quantity));
//         } else {
//             return res.status(400).json({ success: false, message: "Unsupported currency type." });
//         }

//         // Save updated buyer balance
//         await buyer.save();

//         // Update order status and set buyer_id
//         if (order.quantity === quantity) {
//             order.status = ORDER_BOOK_STATUS.COMPLETED;
//             order.buyer_id = buyer._id;
//             await order.save();
//         } else {
//             let finalQuantity;
//             finalQuantity = Number(order.quantity) - Number(quantity);
//             console.log("finalQuantity :", finalQuantity);
//             const generateNewOrder = OrderBook({

//             });
//             await generateNewOrder.save();
//         }

//         return res.status(200).json({ success: true, message: "Buy order executed successfully.", data: order });
//     } catch (error) {
//         console.error("Buy order error:", error);
//         return res.status(500).json({ success: false, message: "Internal server error.", error });
//     }
// };


const buyOrder = async (req, res) => {
    try {
        const { orderTable_id, buyer_id, quantity } = req.body;

        // Validate input
        if (!quantity || isNaN(quantity)) {
            return res.status(400).json({ success: false, message: "Valid 'quantity' is required." });
        }

        // Find the order
        const order = await OrderBook.findById(orderTable_id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Sell order not found." });
        }

        if (order.status === ORDER_BOOK_STATUS.COMPLETED) {
            return res.status(422).json({ success: false, message: "Order has already been completed." });
        }

        // Find the buyer
        const buyer = await User.findById(buyer_id);
        if (!buyer) {
            return res.status(404).json({ success: false, message: "Buyer not found." });
        }

        const { currency, price, seller_id } = order;

        // Check quantity availability
        if (Number(quantity) > Number(order.quantity)) {
            return res.status(400).json({ success: false, message: `Only ${order.quantity} ${currency} available.` });
        }

        // Add purchased amount to buyer's balance
        if (currency === "ETH") {
            buyer.eth_balance = Number(buyer.eth_balance || 0) + Number(quantity);
        } else if (currency === "USD") {
            buyer.usd_balance = Number(buyer.usd_balance || 0) + Number(quantity);
        } else {
            return res.status(400).json({ success: false, message: "Unsupported currency type." });
        }
        await buyer.save();

        // Full quantity match
        if (Number(quantity) === Number(order.quantity)) {
            order.status = ORDER_BOOK_STATUS.COMPLETED;
            order.buyer_id = buyer._id;
            await order.save();

            return res.status(200).json({ success: true, message: "Buy order completed.", data: order });
        }

        // Partial match - update existing order and create a new completed order
        const remainingQuantity = Number(order.quantity) - Number(quantity);
        order.quantity = remainingQuantity;
        await order.save();

        const completedOrder = new OrderBook({
            seller_id,
            buyer_id,
            quantity,
            currency,
            price,
            order_catagory: ORDER_CATAGORY.SELL,
            status: ORDER_BOOK_STATUS.COMPLETED
        });
        await completedOrder.save();

        return res.status(200).json({
            success: true,
            message: "Partial buy order completed. Remaining quantity updated.",
            data: {
                updatedOrder: order,
                completedOrder
            }
        });
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
    createOrder,
    fetchPendingOrders,
}