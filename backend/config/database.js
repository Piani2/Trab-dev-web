const mongoose = require("mongoose");

mongoose.set("toJSON", {
  virtuals: true,
  transform: (doc, converted) => {
    delete converted._id;
    delete converted.__v;
  }
});

async function connectDatabase() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Conectado ao MongoDB Atlas com sucesso!");
}

module.exports = connectDatabase;
