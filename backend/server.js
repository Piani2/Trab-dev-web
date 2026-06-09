// Corrige erro de DNS (ECONNREFUSED querySrv) em algumas redes/ISPs
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do Mongoose para transformar _id em id
mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, converted) => {
    delete converted._id;
    delete converted.__v;
  }
});

// -- Conexão com MongoDB --
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB Atlas com sucesso!'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// -- Schemas e Models --
const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: String,
  profession: String,
  active: { type: Boolean, default: true },
  // Campos extras que vêm da landing page
  interest: String,
  message: String,
}, { timestamps: true });

const Client = mongoose.model('Client', clientSchema);

const measureSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  torax: Number,
  ombro: Number,
  cintura: Number,
  braco: Number,
});

const Measure = mongoose.model('Measure', measureSchema);

const orderSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  model: String,
  fabric: String,
  status: { type: String, default: 'Em andamento' },
  openedAt: String,
});

const Order = mongoose.model('Order', orderSchema);


// -- Rotas (Endpoints) --

// Rota para Leads (Landing Page)
// Agora os leads são salvos na coleção de Clients para aparecerem no sistema interno
app.post('/api/leads', async (req, res) => {
  try {
    const { name, phone, email, address, interest, message } = req.body;
    
    // Verifica se já existe um cliente com o mesmo email
    const existing = await Client.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const newLead = new Client({
      name,
      phone,
      email,
      address,
      interest,
      message,
      active: true, // Define como ativo para aparecer no sistema
      profession: 'Novo Lead', // Valor default para identificar a origem
    });

    await newLead.save();
    res.status(201).json(newLead);
  } catch (err) {
    console.error('Erro ao salvar lead:', err);
    res.status(500).json({ error: 'Erro ao salvar lead' });
  }
});

// Rotas para Clients (Sistema Interno)
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const newClient = new Client(req.body);
    await newClient.save();
    res.status(201).json(newClient);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar cliente' });
  }
});

// Rotas para Measures
app.get('/api/measures', async (req, res) => {
  try {
    const measures = await Measure.find();
    res.json(measures);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar medidas' });
  }
});

app.post('/api/measures', async (req, res) => {
  try {
    // Para simplificar: se já existir, pode atualizar (opcional), mas vamos criar ou sobrescrever
    const { clientId } = req.body;
    await Measure.findOneAndDelete({ clientId }); // Remove antiga se houver
    
    const newMeasure = new Measure(req.body);
    await newMeasure.save();
    res.status(201).json(newMeasure);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar medidas' });
  }
});

// Rotas para Orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar pedido' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
