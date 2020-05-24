/* eslint-disable strict */
const { gql, PubSub } = require('apollo-server-express');
const service = require('./service');

const pubsub = new PubSub();

const typeDefs = gql`
  type User {
    id: Int!
    email: String!
    first_name: String!
    last_name: String!
  }

  type Help {
    wants_help: Boolean!
  }

  type HelpStatus {
    user_id: Int
    immunocompromised: Boolean!
    unemployment: Boolean!
    essential: Boolean!
  }

  type HelpOptions {
    user_id: Int
    wants_help: Boolean!
    grocery_delivery: Boolean!
    walk_dogs: Boolean!
    donations: Boolean!
    counceling: Boolean!
    career_services: Boolean!
  }

  type Profile {
    id: Int
    user_id: Int
    avatar: String
    neighborhood: String
    story: String
    help: Help
    help_status: HelpStatus
    help_options: HelpOptions
    user: User
  }

  type Message {
    id: Int!
    thread_id: Int!
    sender_id: Int!
    receiver_id: Int!
    subject: String
    body: String!
    date_sent: String!
  }

  type MessageThread {
    id: Int!
    created_by: Int!
    recipient: Int!
    last_msg_timestamp: String!
  }

  type Query {
    user(email: String!): User

    profile(user_id: Int!): Profile

    getProfileMatches(
      wants_help: Boolean!
      grocery_delivery: Boolean!
      walk_dogs: Boolean!
      donations: Boolean!
      counceling: Boolean!
      career_services: Boolean!
    ): [Profile]

    getMessageThread(created_by: Int!, recipient: Int!): MessageThread

    getUserMessageThreads(user_id: Int!): [MessageThread]

    getMessageHistory(thread_id: Int!): [Message]
  }

  type Mutation {
    postProfile(
      user_id: Int!
      avatar: String
      neighborhood: String
      story: String
      wants_help: Boolean!
      immunocompromised: Boolean!
      unemployment: Boolean!
      essential: Boolean!
      grocery_delivery: Boolean!
      walk_dogs: Boolean!
      donations: Boolean!
      counceling: Boolean!
      career_services: Boolean!
    ): Profile

    postMessage(thread_id: Int, sender_id: Int!, receiver_id: Int!, subject: String, body: String!): Message
  }

  type Subscription {
    messageAdded: Message
  }
`;

const MESSAGE_ADDED = 'MESSAGE_ADDED';

const resolvers = {
  Query: {
    user: (parent, args, context) => {
      return service.getUserByEmail(args.email, context.app.get('db'));
    },
    profile: (parent, args, context) => {
      return service.getProfile(args.user_id, context.app.get('db'));
    },

    getProfileMatches: (parent, args, context) => {
      return service.getProfileMatches(args, context.app.get('db'));
    },
    getMessageThread: (parent, args, context) => {
      return service.getMessageThread(args, context.app.get('db'));
    },
    getUserMessageThreads: (parent, args, context) => {
      return service.getUserMessageThreads(args.user_id, context.app.get('db'));
    },
    getMessageHistory: (parent, args, context) => {
      console.log('fetching msgHistory');
      return service.getMessageHistory(args, context.app.get('db'));
    },
  },
  Profile: {
    help(parent, args, context) {
      return service.getProfileHelp(parent.user_id, context.app.get('db'));
    },
    help_status(parent, args, context) {
      return service.getProfileHelpStatus(parent.user_id, context.app.get('db'));
    },
    help_options(parent, args, context) {
      return service.getProfileHelpOptions(parent.user_id, context.app.get('db'));
    },
    user(parent, args, context) {
      return service.getUserByID(parent.user_id, context.app.get('db'));
    },
  },
  Mutation: {
    postProfile(parent, args, context) {
      return service.insertProfile(args, context.app.get('db'));
    },
    postMessage: async (parent, args, context) => {
      const msg = await service.insertMessage(args, context.app.get('db'));
      console.log('in message mutation msg is ', msg);
      pubsub.publish(MESSAGE_ADDED, { messageAdded: msg });

      return msg;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator([MESSAGE_ADDED]),
    },
  },
};

module.exports = { typeDefs, resolvers };
