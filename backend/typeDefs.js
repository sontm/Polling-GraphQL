import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Query {
    hello: String!
    cats: [Cat!]!
  }

  type Cat {
    id: ID!
    name: String!
  }

  type Mutation {
    createCat(name: String!): Cat!
  }

  type Poll {
    id: ID!
    question: String
    choices: [Choice]
  }

  type Choice {
    id: ID!
    choice: String
    poll: Poll
    votes: [Vote]
  }

  type Vote {
    id: ID!
    user: String
    choice: Choice
  }

`;
