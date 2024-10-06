import "reflect-metadata";
import express from "express";
import { ApolloServer} from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { MessagesWebsocketServer } from "./plugins/web-sock/socket-controller";
import { UserResolver } from "./resources/users/resolvers";
import { MessageResolver } from "./resources/messages/resolvers";
import { GroupsResolver } from "./resources/groups/resolvers";

async function bootstrap() {
  const schema = await buildSchema({
    resolvers: [UserResolver, MessageResolver, GroupsResolver],
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
  const httpServer = app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`),
  );
  const wss = new MessagesWebsocketServer(httpServer);
}

// Call the bootstrap function to run the server
bootstrap().catch((error) => {
  console.error("Error starting server:", error);
});
