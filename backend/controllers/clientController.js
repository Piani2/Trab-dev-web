const Client = require("../models/Client");

async function listClients(req, res) {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar clientes" });
  }
}

async function createClient(req, res) {
  try {
    const newClient = new Client(req.body);
    await newClient.save();
    res.status(201).json(newClient);
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar cliente" });
  }
}

module.exports = {
  listClients,
  createClient,
};
