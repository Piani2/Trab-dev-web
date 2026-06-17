const Measure = require("../models/Measure");

async function listMeasures(req, res) {
  try {
    const measures = await Measure.find();
    res.json(measures);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar medidas" });
  }
}

async function saveMeasure(req, res) {
  try {
    const { clientId } = req.body;
    await Measure.findOneAndDelete({ clientId });

    const newMeasure = new Measure(req.body);
    await newMeasure.save();
    res.status(201).json(newMeasure);
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar medidas" });
  }
}

module.exports = {
  listMeasures,
  saveMeasure,
};
