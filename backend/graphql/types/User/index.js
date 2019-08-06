export default `
  type User {
    _id: ID
    username: String
    password: String
    passwordBcrypt: String
    jwt: String
    mail: String
    fullname: String
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
  }
`;
