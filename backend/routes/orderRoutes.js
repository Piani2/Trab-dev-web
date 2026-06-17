const express = require("express");
const {
  createOrder,
  deleteOrder,
  listOrders,
  updateOrder,
} = require("../controllers/orderController");

const router = express.Router();

router.get("/", listOrders);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

module.exports = router;
