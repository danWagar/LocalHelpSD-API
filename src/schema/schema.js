/* eslint-disable strict */
const graphql = require('graphql');
const service = require('./service');

const {
  GraphQLObjectType,
  GraphQLUnionType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLSchema,
} = graphql;

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

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { email: { type: GraphQLString } },
      resolve(parent, args, context) {
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
        console.log('In getProfileMatches', args);
        return service.getProfileMatches(args, context.app.get('db'));
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'MUTATE_PROFILE',
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
