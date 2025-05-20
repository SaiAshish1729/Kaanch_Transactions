const express = require("express");
const { createSellOrder, buyOrder, fetchPendingOrders } = require("../Controller/transactions");
const router = express.Router();

router.post("/create-sell-order", createSellOrder);
router.post("/purchase-order", buyOrder);
router.get("/get-order-list", fetchPendingOrders);


module.exports = router 