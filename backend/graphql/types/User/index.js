export default `
  type User {
    id: ID
    username: String
    password: String
    passwordBcrypt: String
    jwt: String
    mail: String
    name: String
  }

  type Query {
    login(username: String!, password: String!): User
    me: User
    profile(username:String!): User
  }

  type Mutation {
    createUser(user: SignUpRequest): User!
  }


  input SignUpRequest {
    username: String!
    password: String!
    name: String
    mail: String
  }
`;
