import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resources/users/resolvers";

async function bootstrap() {
  // Build the GraphQL schema
  const schema = await buildSchema({
    resolvers: [UserResolver],
  });

  // Initialize the Apollo Server
  const server = new ApolloServer({ schema });

  // Start the Apollo Server before applying middleware
  await server.start();

  // Create the Express app
  const app = express();

  // Apply Apollo GraphQL middleware to the Express app
  server.applyMiddleware({ app });

  // Start the Express server
  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`),
  );
}

// Call the bootstrap function to run the server
bootstrap().catch((error) => {
  console.error("Error starting server:", error);
});
