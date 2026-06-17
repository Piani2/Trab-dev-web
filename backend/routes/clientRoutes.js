const express = require("express");
const { createClient, listClients } = require("../controllers/clientController");

const router = express.Router();

router.get("/", listClients);
router.post("/", createClient);

module.exports = router;
