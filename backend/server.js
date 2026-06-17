require("dotenv").config();

const express = require("express");
const cors = require("cors");

const configureDns = require("./config/dns");
const connectDatabase = require("./config/database");
const clientRoutes = require("./routes/clientRoutes");
const leadRoutes = require("./routes/leadRoutes");
const measureRoutes = require("./routes/measureRoutes");
const orderRoutes = require("./routes/orderRoutes");

configureDns();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/leads", leadRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/measures", measureRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 3000;

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao conectar ao MongoDB:", err);
    process.exit(1);
  });
