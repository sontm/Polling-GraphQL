export default `
  type User {
    _id: ID
    username: String
    password: String
    passwordBcrypt: String
    jwt: String
  }

  type Query {
    login(username: String!, password: String!): User
    me: User
  }

  type Mutation {
    createUser(user: SignUpRequest): User!
  }


  input SignUpRequest {
    username: String!
    password: String!
  }
`;
