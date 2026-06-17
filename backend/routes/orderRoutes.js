const express = require("express");
const { createOrder, listOrders } = require("../controllers/orderController");

const router = express.Router();

router.get("/", listOrders);
router.post("/", createOrder);

module.exports = router;
