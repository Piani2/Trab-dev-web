require("dotenv").config();

const mongoose = require("mongoose");
const configureDns = require("./config/dns");
const connectDatabase = require("./config/database");
const Client = require("./models/Client");
const Measure = require("./models/Measure");
const Order = require("./models/Order");

configureDns();

async function seedDatabase() {
  try {
    console.log("Conectando ao MongoDB...");
    await connectDatabase();

    console.log("Limpando dados antigos...");
    await Client.deleteMany({});
    await Measure.deleteMany({});
    await Order.deleteMany({});

    console.log("Criando clientes...");
    const clients = await Client.insertMany([
      { name: "Bruce Wayne", phone: "11988887777", email: "bruce@wayne.com", address: "Mansão Wayne", profession: "Empresário", active: true },
      { name: "Clark Kent", phone: "11977776666", email: "clark@dailyplanet.com", address: "Metropolis", profession: "Jornalista", active: true },
      { name: "Arthur Curry", phone: "11966665555", email: "arthur@atlantis.com", interest: "Terno Sob Medida", message: "Preciso de um terno resistente à água", profession: "Novo Lead", active: true }
    ]);

    console.log("Criando medidas...");
    await Measure.insertMany([
      { clientId: clients[0]._id, torax: 110, ombro: 50, cintura: 90, braco: 68 },
      { clientId: clients[1]._id, torax: 115, ombro: 55, cintura: 95, braco: 70 }
    ]);

    console.log("Criando pedidos...");
    await Order.insertMany([
      { clientId: clients[0]._id, model: "Terno Slim Fit Preto", fabric: "Lã Fria Super 120", status: "Em andamento", openedAt: new Date().toLocaleDateString("pt-BR") },
      { clientId: clients[1]._id, model: "Camisa Social Clássica", fabric: "Algodão Egípcio", status: "Pronto para prova", openedAt: new Date().toLocaleDateString("pt-BR") },
      { clientId: clients[1]._id, model: "Calça Alfaiataria", fabric: "Linho", status: "Concluído", openedAt: new Date().toLocaleDateString("pt-BR") }
    ]);

    console.log("Banco de dados populado com sucesso!");
  } catch (error) {
    console.error("Erro ao popular o banco de dados:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
