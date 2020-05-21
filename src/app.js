/* eslint-disable strict */
require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const http = require('http');
const { typeDefs, resolvers } = require('./schema/schema');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, PORT } = require('./config');
const authRouter = require('./auth/auth-router');
const userRouter = require('./user/user-router');

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => req,
});

app.use(
  morgan(NODE_ENV === 'production' ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test',
  })
);
app.use(cors());
app.use(helmet());
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

server.applyMiddleware({
  app,
  path: '/api/graphql',
});
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: PORT }, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`);
});

//app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: schema }));

// app.use(
//   '/api/graphql',
//   graphqlHTTP((req) => ({
//     schema,
//     context: req,
//     graphiql: true,
//   }))
// );

module.exports = app;
