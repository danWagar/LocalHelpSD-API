/* eslint-disable strict */
const { gql, PubSub } = require('apollo-server-express');
const { withFilter } = require('graphql-subscriptions');
const service = require('./service');

const pubsub = new PubSub();

const MESSAGE_ADDED = 'MESSAGE_ADDED';
const MESSAGE_THREAD_UPDATED = 'MESSAGE_THREAD_UPDATED';

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
    time_read: String
    date_sent: String!
  }

  type MessageThread {
    id: Int!
    created_by: Int!
    recipient: Int!
    notify_user: Int
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

    updateMessageTimeRead(thread_id: Int!): Message

    updateMessageThreadNotification(id: Int!): MessageThread
  }

  type Subscription {
    messageAdded(thread_id: Int!): Message

    messageThreadUpdated(user_id: Int!): MessageThread
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
    getMessageThread: async (parent, args, context) => {
      console.log('retriving messageThread with args ', args);
      const result = await service.getMessageThread(args, context.app.get('db'));
      console.log('retrieved messageThread is ', result);

      return result;
    },
    getUserMessageThreads: async (parent, args, context) => {
      console.log('retrieving userMessageThreads');
      const result = await service.getUserMessageThreads(args.user_id, context.app.get('db'));
      console.log(result);
      return result;
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

      const thread = await service.updateMessageThreadUnreadMessages(
        args.thread_id,
        args.receiver_id,
        context.app.get('db')
      );

      pubsub.publish(MESSAGE_ADDED, { messageAdded: msg });
      pubsub.publish(MESSAGE_THREAD_UPDATED, { messageThreadUpdated: thread });

      return msg;
    },
    updateMessageTimeRead: async (parent, args, context) => {
      const result = await service.updateMessageTimeRead(args.thread_id, context.app.get('db'));

      const thread = await service.updateMessageThreadUnreadMessages(
        args.thread_id,
        null,
        context.app.get('db')
      );
      pubsub.publish(MESSAGE_THREAD_UPDATED, { messageThreadUpdated: thread });

      return result;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([MESSAGE_ADDED]),
        (payload, variables) => {
          return payload.messageAdded.thread_id === variables.thread_id;
        }
      ),
    },

    messageThreadUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([MESSAGE_THREAD_UPDATED]),
        (payload, variables) => {
          const updatedThread = payload.messageThreadUpdated;
          const userId = variables.user_id;
          return (
            updatedThread.notify_user === userId ||
            ((updatedThread.created_by === userId || updatedThread.recipient === userId) &&
              updatedThread.notify_user === null)
          );
        }
      ),
    },
  },
};

module.exports = { typeDefs, resolvers };
