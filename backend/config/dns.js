const dns = require("dns");

function configureDns() {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

module.exports = configureDns;
