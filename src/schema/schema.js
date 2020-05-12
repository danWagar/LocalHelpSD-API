/* eslint-disable strict */
const graphql = require('graphql');
const service = require('./service');

const { GraphQLObjectType, GraphQLBoolean, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;

const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    id: { type: GraphQLInt },
    user_name: { type: GraphQLString },
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
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { user_name: { type: GraphQLString } },
      resolve(parent, args, context) {
        return service.getUserByName(args.user_name, context.app.get('db'));
      },
    },
    profile: {
      type: ProfileType,
      args: { user_id: { type: GraphQLInt } },
      resolve(parent, args, context) {
        return service.getProfile(args.user_id, context.app.get('db'));
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addProfile: {
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
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
