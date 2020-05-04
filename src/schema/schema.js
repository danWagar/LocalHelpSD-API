/* eslint-disable strict */
const graphql = require('graphql');
const service = require('./service');

const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;

const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    id: { type: GraphQLInt },
    user_name: { type: GraphQLString }
  })
});

const ProfileType = new GraphQLObjectType({
  name: 'ProfileType',
  fields: () => ({
    id: { type: GraphQLInt },
    user_id: { type: GraphQLInt },
    avatar: { type: GraphQLString },
    age: { type: GraphQLInt },
    story: { type: GraphQLString },
    user: {
      type: UserType,
      resolve(parent, args, context) {
        return service.getUserByID(parent.user_id, context.app.get('db'));
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { user_name: { type: GraphQLString } },
      resolve(parent, args, context) {
        return service.getUserByName(args.user_name, context.app.get('db'));
      }
    },
    profile: {
      type: ProfileType,
      args: { user_id: { type: GraphQLInt } },
      resolve(parent, args, context) {
        return service.getProfile(args.user_id, context.app.get('db'));
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addProfile: {
      type: ProfileType,
      args: {
        user_id: { type: GraphQLInt },
        avatar: { type: GraphQLString },
        age: { type: GraphQLInt },
        story: { type: GraphQLString }
      },
      resolve(parent, args, context) {
        return service.insertProfile(args, context.app.get('db'));
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
