/* eslint-disable strict */
const graphql = require('graphql');

const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    user_name: { type: GraphQLString }
  })
});

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: GraphQLID },
    avatar: { type: GraphQLString },
    age: { type: GraphQLInt },
    story: { type: GraphQLString }
  })
});

const getProfile = async (id, context) => {
  const db = context.app.get('db');
  const result = await db
    .select('id', 'user_name')
    .from('users')
    .where({ id })
    .first();

  console.log(result);
  return result;
};

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args, context) {
        const result = getProfile(args.id, context);
        console.log('rootquery result ', result);
        return result;
      }
    },
    profile: {
      type: ProfileType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return db
          .select('*')
          .from('profile')
          .where(args.id);
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
        user_id: GraphQLInt,
        avatar: GraphQLString,
        age: { type: GraphQLInt },
        story: { type: GraphQLString }
      },
      resolve(parent, args) {
        let profile = { user_id, avatar, age, story };
        return db.insert(profile).into('profile');
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery
});
