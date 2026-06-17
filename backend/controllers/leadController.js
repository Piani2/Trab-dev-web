const Client = require("../models/Client");

async function createLead(req, res) {
  try {
    const { name, phone, email, address, interest, message } = req.body;

    const existing = await Client.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    const newLead = new Client({
      name,
      phone,
      email,
      address,
      interest,
      message,
      active: true,
      profession: "Novo Lead",
    });

    await newLead.save();
    res.status(201).json(newLead);
  } catch (err) {
    console.error("Erro ao salvar lead:", err);
    res.status(500).json({ error: "Erro ao salvar lead" });
  }
}

module.exports = {
  createLead,
};
