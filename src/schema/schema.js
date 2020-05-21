/* eslint-disable strict */
const graphql = require('graphql');
const service = require('./service');
const { gql } = require('apollo-server-express');

// const { GraphQLObjectType, GraphQLBoolean, GraphQLString, GraphQLInt, GraphQLList, GraphQLSchema } = graphql;

//
//Type Definitions
//
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

  type MessageThread {
    id: Int!
    created_by: Int!
    recipient: Int!
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
`;

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
    postMessage(parent, args, context) {
      return service.insertMessage(args, context.app.get('db'));
    },
  },
};

module.exports = { typeDefs, resolvers };

/*


const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    postProfile: {
      type: ProfileType,
      args: {
        user_id: { type: GraphQLInt, required: true, unique: true },
        avatar: { type: GraphQLString },
        neighborhood: { type: GraphQLString },
        story: { type: GraphQLString },
        wants_help: { type: GraphQLBoolean, required: true },
        immunocompromised: { type: GraphQLBoolean, required: true },
        unemployment: { type: GraphQLBoolean, required: true },
        essential: { type: GraphQLBoolean, required: true },
        grocery_delivery: { type: GraphQLBoolean, required: true },
        walk_dogs: { type: GraphQLBoolean, required: true },
        donations: { type: GraphQLBoolean, required: true },
        counceling: { type: GraphQLBoolean, required: true },
        career_services: { type: GraphQLBoolean, required: true },
      },
      resolve(parent, args, context) {
        return service.insertProfile(args, context.app.get('db'));
      },
    },
    postMessage: {
      type: MessageType,
      args: {
        thread_id: { type: GraphQLInt },
        sender_id: { type: GraphQLInt, require: true },
        receiver_id: { type: GraphQLInt, require: true },
        subject: { type: GraphQLString },
        body: { type: GraphQLString, require: true },
      },
      resolve(parent, args, context) {
        return service.insertMessage(args, context.app.get('db'));
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
*/
