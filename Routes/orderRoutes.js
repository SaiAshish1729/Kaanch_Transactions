const express = require("express");
const { createOrder, buyOrder, fetchPendingOrders } = require("../Controller/transactions");
const { validateRequest, createSellOrderValidation } = require("../Validations/tnx");
const router = express.Router();

router.post("/create-order", validateRequest(createSellOrderValidation), createOrder);
router.post("/purchase-order", buyOrder);
router.get("/get-order-list", fetchPendingOrders);


module.exports = router 