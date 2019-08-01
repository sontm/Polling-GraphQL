export default `
  type User {
    _id: ID
    username: String
    password: String
  }

  type Query {
    login(username: String!, password: String!): User
  }

  type Mutation {
    createUser(user: SignUpRequest): User!
  }


  input SignUpRequest {
    username: String!
    password: String!
  }
`;
