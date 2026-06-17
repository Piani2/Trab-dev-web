const Order = require("../models/Order");

function addDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

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
    const openedAt = req.body.openedAt || new Date().toISOString().split("T")[0];
    const newOrder = new Order({
      ...req.body,
      openedAt,
      dueDate: addDays(openedAt, 30),
    });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar pedido" });
  }
}

async function updateOrder(req, res) {
  try {
    const currentOrder = await Order.findById(req.params.id);
    if (!currentOrder) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    const openedAt = req.body.openedAt || currentOrder.openedAt;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        openedAt,
        dueDate: addDays(openedAt, 30),
      },
      { new: true, runValidators: true }
    );

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar pedido" });
  }
}

async function deleteOrder(req, res) {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir pedido" });
  }
}

module.exports = {
  listOrders,
  createOrder,
  updateOrder,
  deleteOrder,
};
