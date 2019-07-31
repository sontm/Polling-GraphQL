export default `
  type Poll {
    _id: ID!
    question: String!
    choices: [Choice!]!
  }

  type Query {
    poll(_id: ID!): Poll!
    polls: [Poll!]!
  }

  type Mutation {
    createPoll(poll: CreatePollInput): Poll!
  }

  input CreatePollInput {
    question: String!
  }
`;
