export default `
  type Choice {
    _id: ID!
    text: String!
    poll: Poll!
  }

  type Query {
    choice(_id: ID!): Choice!
    choices: [Choice!]!
  }

  type Mutation {
    createChoice(choice: CreateChoiceInput): Choice!
  }

  input CreateChoiceInput {
    text: String!
    poll: ID!
  }
`;
