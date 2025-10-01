require("dotenv").config();
const express = require("express");
const { AppDataSource } = require("./data-source");
const medicoRouter = require("./routes/medico");

const app = express();
app.use(express.json());
app.use("/medico", medicoRouter);

const PORT = Number(process.env.PORT || 3000);

AppDataSource.initialize()
  .then(() => {
    console.log("Conectado a MySQL con TypeORM");
    app.listen(PORT, () => {
      console.log(`🚀 Servidor en http://localhost:${PORT}`);
      console.log(`📚 Endpoints: GET/POST/PUT/DELETE /medico`);
    });
  })
  .catch((err) => {
    console.error("Error al inicializar DataSource:", err);
    process.exit(1);
  });