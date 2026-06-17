require("dotenv").config();

const mongoose = require("mongoose");
const configureDns = require("./config/dns");
const connectDatabase = require("./config/database");
const Client = require("./models/Client");
const Measure = require("./models/Measure");
const Order = require("./models/Order");

configureDns();

function isoDaysAgo(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

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
      {
        name: "Bruce Wayne",
        phone: "11988887777",
        email: "bruce@wayne.com",
        address: "Mansão Wayne",
        profession: "Empresário",
        active: true
      },
      {
        name: "Clark Kent",
        phone: "11977776666",
        email: "clark@dailyplanet.com",
        address: "Metropolis",
        profession: "Jornalista",
        active: true
      },
      {
        name: "Arthur Curry",
        phone: "11966665555",
        email: "arthur@atlantis.com",
        address: "Avenida Atlântica, 100",
        profession: "Novo Lead",
        interest: "Terno sob medida",
        message: "Preciso de um terno resistente à água",
        active: true
      }
    ]);

    console.log("Criando medidas...");
    await Measure.insertMany([
      { clientId: clients[0]._id, torax: 110, ombro: 50, cintura: 90, braco: 68 },
      { clientId: clients[1]._id, torax: 115, ombro: 55, cintura: 95, braco: 70 }
    ]);

    const firstOpenedAt = isoDaysAgo(20);
    const secondOpenedAt = isoDaysAgo(12);
    const thirdOpenedAt = isoDaysAgo(5);

    console.log("Criando pedidos com prazo fixo de 30 dias...");
    await Order.insertMany([
      {
        clientId: clients[0]._id,
        model: "Terno slim fit preto",
        fabric: "Lã fria Super 120",
        status: "Em costura",
        openedAt: firstOpenedAt,
        dueDate: addDays(firstOpenedAt, 30)
      },
      {
        clientId: clients[1]._id,
        model: "Camisa social clássica",
        fabric: "Algodão egípcio",
        status: "Prova agendada",
        openedAt: secondOpenedAt,
        dueDate: addDays(secondOpenedAt, 30)
      },
      {
        clientId: clients[1]._id,
        model: "Calça de alfaiataria",
        fabric: "Linho",
        status: "Em corte",
        openedAt: thirdOpenedAt,
        dueDate: addDays(thirdOpenedAt, 30)
      }
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
