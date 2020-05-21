/* eslint-disable strict */
const graphql = require('graphql');
const service = require('./service');

const { GraphQLObjectType, GraphQLBoolean, GraphQLString, GraphQLInt, GraphQLList, GraphQLSchema } = graphql;

//
//Type Definitions
//
const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    id: { type: GraphQLInt },
    email: { type: GraphQLString },
    first_name: { type: GraphQLString },
    last_name: { type: GraphQLString },
  }),
});

const HelpStatusType = new GraphQLObjectType({
  name: 'HelpStatusType',
  fields: () => ({
    user_id: { type: GraphQLInt },
    immunocompromised: { type: GraphQLBoolean, required: true },
    unemployment: { type: GraphQLBoolean, required: true },
    essential: { type: GraphQLBoolean, required: true },
  }),
});

const HelpOptionType = new GraphQLObjectType({
  name: 'HelpOptionType',
  fields: () => ({
    user_id: { type: GraphQLInt },
    wants_help: { type: GraphQLBoolean, required: true },
    grocery_delivery: { type: GraphQLBoolean, required: true },
    walk_dogs: { type: GraphQLBoolean, required: true },
    donations: { type: GraphQLBoolean, required: true },
    counceling: { type: GraphQLBoolean, required: true },
    career_services: { type: GraphQLBoolean, required: true },
  }),
});

const HelpType = new GraphQLObjectType({
  name: 'HelpType',
  fields: () => ({
    wants_help: { type: GraphQLBoolean, required: true },
  }),
});

const ProfileType = new GraphQLObjectType({
  name: 'ProfileType',
  fields: () => ({
    id: { type: GraphQLInt },
    user_id: { type: GraphQLInt, required: true, unique: true },
    avatar: { type: GraphQLString },
    neighborhood: { type: GraphQLString },
    story: { type: GraphQLString },
    help: {
      type: HelpType,
      resolve: (parent, args, context) => {
        return service.getProfileHelp(parent.user_id, context.app.get('db'));
      },
    },
    help_status: {
      type: HelpStatusType,
      resolve: (parent, args, context) => {
        return service.getProfileHelpStatus(parent.user_id, context.app.get('db'));
      },
    },
    help_options: {
      type: HelpOptionType,
      resolve: (parent, args, context) => {
        return service.getProfileHelpOptions(parent.user_id, context.app.get('db'));
      },
    },
    user: {
      type: UserType,
      resolve: (parent, args, context) => {
        return service.getUserByID(parent.user_id, context.app.get('db'));
      },
    },
  }),
});

const MessageThreadType = new GraphQLObjectType({
  name: 'MessageThreadType',
  fields: () => ({
    id: { type: GraphQLInt },
    created_by: { type: GraphQLInt },
    recipient: { type: GraphQLInt },
  }),
});

const MessageType = new GraphQLObjectType({
  name: 'MessageType',
  fields: () => ({
    id: { type: GraphQLInt },
    thread_id: { type: GraphQLInt },
    sender_id: { type: GraphQLInt },
    receiver_id: { type: GraphQLInt },
    subject: { type: GraphQLString },
    body: { type: GraphQLString },
    date_sent: { type: GraphQLString },
  }),
});

//
//Query Definitions
//
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { email: { type: GraphQLString } },
      resolve(parent, args, context) {
        console.log(args);
        return service.getUserByEmail(args.email, context.app.get('db'));
      },
    },
    profile: {
      type: ProfileType,
      args: { user_id: { type: GraphQLInt } },
      resolve(parent, args, context) {
        return service.getProfile(args.user_id, context.app.get('db'));
      },
    },
    getProfileMatches: {
      type: GraphQLList(ProfileType),
      args: {
        wants_help: { type: GraphQLBoolean, required: true },
        grocery_delivery: { type: GraphQLBoolean, required: true },
        walk_dogs: { type: GraphQLBoolean, required: true },
        donations: { type: GraphQLBoolean, required: true },
        counceling: { type: GraphQLBoolean, required: true },
        career_services: { type: GraphQLBoolean, required: true },
      },
      resolve(parent, args, context) {
        return service.getProfileMatches(args, context.app.get('db'));
      },
    },
    getMessageThread: {
      type: MessageThreadType,
      args: {
        created_by: { type: GraphQLInt, required: true },
        recipient: { type: GraphQLInt, required: true },
      },
      resolve(parent, args, context) {
        return service.getMessageThread(args, context.app.get('db'));
      },
    },
    getUserMessageThreads: {
      type: GraphQLList(MessageThreadType),
      args: { user_id: { type: GraphQLInt, required: true } },
      resolve(parents, args, context) {
        return service.getUserMessageThreads(args.user_id, context.app.get('db'));
      },
    },
    getMessageHistory: {
      type: GraphQLList(MessageType),
      args: {
        thread_id: { type: GraphQLInt, required: true },
      },
      resolve(parent, args, context) {
        return service.getMessageHistory(args, context.app.get('db'));
      },
    },
  },
});

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
