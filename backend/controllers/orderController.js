const Order = require("../models/Order");

async function listOrders(req, res) {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
}

async function createOrder(req, res) {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar pedido" });
  }
}

module.exports = {
  listOrders,
  createOrder,
};
