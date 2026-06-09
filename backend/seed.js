// Corrige erro de DNS (ECONNREFUSED querySrv) em algumas redes/ISPs
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');

// Recriando os Schemas aqui para o script rodar de forma independente
const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: String,
  profession: String,
  active: { type: Boolean, default: true },
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

async function seedDatabase() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado!');

    // Limpa o banco de dados atual
    console.log('Limpando dados antigos...');
    await Client.deleteMany({});
    await Measure.deleteMany({});
    await Order.deleteMany({});

    // Cria Clientes
    console.log('Criando clientes...');
    const clients = await Client.insertMany([
      { name: 'Bruce Wayne', phone: '11988887777', email: 'bruce@wayne.com', address: 'Mansão Wayne', profession: 'Empresário', active: true },
      { name: 'Clark Kent', phone: '11977776666', email: 'clark@dailyplanet.com', address: 'Metropolis', profession: 'Jornalista', active: true },
      { name: 'Arthur Curry', phone: '11966665555', email: 'arthur@atlantis.com', interest: 'Terno Sob Medida', message: 'Preciso de um terno resistente à água', profession: 'Novo Lead', active: true } // Simula alguém vindo da landing page
    ]);

    // Cria Medidas (para Bruce e Clark)
    console.log('Criando medidas...');
    await Measure.insertMany([
      { clientId: clients[0]._id, torax: 110, ombro: 50, cintura: 90, braco: 68 },
      { clientId: clients[1]._id, torax: 115, ombro: 55, cintura: 95, braco: 70 }
    ]);

    // Cria Pedidos (para Bruce e Clark)
    console.log('Criando pedidos...');
    await Order.insertMany([
      { clientId: clients[0]._id, model: 'Terno Slim Fit Preto', fabric: 'Lã Fria Super 120', status: 'Em andamento', openedAt: new Date().toLocaleDateString('pt-BR') },
      { clientId: clients[1]._id, model: 'Camisa Social Clássica', fabric: 'Algodão Egípcio', status: 'Pronto para prova', openedAt: new Date().toLocaleDateString('pt-BR') },
      { clientId: clients[1]._id, model: 'Calça Alfaiataria', fabric: 'Linho', status: 'Concluído', openedAt: new Date().toLocaleDateString('pt-BR') }
    ]);

    console.log('✅ Banco de dados populado com sucesso!');
    process.exit(0); // Sai do script com sucesso
  } catch (error) {
    console.error('❌ Erro ao popular o banco de dados:', error);
    process.exit(1); // Sai do script com erro
  }
}

// Executa a função
seedDatabase();