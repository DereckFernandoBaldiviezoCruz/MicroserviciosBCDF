const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { AppDataSource } = require("./data-source");
const typeDefs = require("./schema/typeDefs");
const resolvers = require("./schema/resolvers");

async function startServer() {
  await AppDataSource.initialize();
  console.log("✅ Conectado a la base de datos");

  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log(`🚀 Servidor listo en http://localhost:4000${server.graphqlPath}`);
  });
}

startServer();
