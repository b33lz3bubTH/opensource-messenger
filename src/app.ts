import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resources/users/resolvers";
import { MessageResolver } from "./resources/messages/resolvers";

async function bootstrap() {
  const schema = await buildSchema({
    resolvers: [UserResolver, MessageResolver],
  });

  const server = new ApolloServer({
    schema,
    formatError: (e) => {
      console.error(e);
      return {
        message: e.message,
        code: e.extensions?.exception?.code || 500,
        locations: e.locations,
        path: e.path,
      };
    },
  });

  await server.start();

  const app = express();

  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`),
  );
}

// Call the bootstrap function to run the server
bootstrap().catch((error) => {
  console.error("Error starting server:", error);
});
