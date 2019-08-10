import {
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';

import {
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime
} from 'graphql-iso-date';

export default `
  scalar Date
  type Vote {
    id: ID
    username: String!
  }
  type Choice {
    id: ID
    text: String!
    votes: [Vote!]
  }
  type Poll {
    id: ID!
    question: String!
    createdBy: String!
    createdDate: Date
    expireDate: Date
    choices: [Choice!]!
  }


  type Query {
    poll(id: ID!): Poll!
    polls: [Poll!]!
  }
  type Mutation {
    createFullPoll(pollWithChoices: CreateFullPollInput): Poll!
    createChoice(choice: CreateChoiceInput): Poll!
    createVote(vote: CreateVoteInput): Poll!
  }

  input CreateChoiceInput {
    text: String!
    poll: ID!
  }
  input CreateVoteInput {
    username: String!
    poll: ID!
    choice: ID!
  }
  input CreateFullPollInput {
    question: String!
    createdBy: String!
    choices: [ChoiceInput]
    inDay: Int
    inHour: Int
    inMinute: Int
  }
  input ChoiceInput {
    text: String!
  }
`;
