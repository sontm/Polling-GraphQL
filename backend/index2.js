import { ApolloServer, gql, graphqlExpress, 
  AuthenticationError, ForbiddenError } from "apollo-server-express";
import express from "express";
import mongoose from "mongoose";

import typeDefs from "./graphql/types/";
import resolvers from "./graphql/resolvers/";
import { userInfo } from "os";

require('dotenv').config()
const bodyParser = require('body-parser')
const jwt = require('express-jwt')
const jsonwebtoken = require('jsonwebtoken')
var AWS = require("aws-sdk");

// var { ApolloServer, gql } = require('apollo-server-express');
// var { express } = require('express');
// var { mongoose } = require('mongoose');
// var { resolvers } = require('./resolvers');
// var { typeDefs } = require('./typeDefs');

const getTokenFromHeaders = (req) => {
  const { headers: { authorization } } = req;
  if(authorization && authorization.split(' ')[0] === 'Bearer') {
      return authorization.split(' ')[1];
  }
  return null;
};

const startServer = async () => {
  const app = express();

  // bodyparser
  app.use(bodyParser.json())

  // authentication middleware
  // ------------Don't know why jwt not work, so Implement custom in context
  // const authMiddleware = jwt({
  //   secret: process.env.JWT_SECRET,
  //   credentialsRequired: false,
  //   getToken: getTokenFromHeaders
  // })
  // app.use(authMiddleware)

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      var user = null;
      let token = getTokenFromHeaders(req)
      if (token) {
        jsonwebtoken.verify(token,process.env.JWT_SECRET,function(err,decodedData){
          if(err) {
            //console.log("Custom JWT VErify Error")
            //throw new AuthenticationError("[GROUP3] Incorrect Authorization");
          } else {
            user = {
              id: decodedData.id,
              username: decodedData.username
            }
          }
        }
      )}
      // add the user to the context
      return { user };
    },
  });

  server.applyMiddleware({ app });
if (process.env.USE_MONGO) {
  await mongoose.connect("mongodb://localhost:27017/test", {
    useNewUrlParser: true
  });
} else {
  AWS.config.update({
    region: "eu-west-2",
    accessKeyId: 'xxxx',
    secretAccessKey: 'xxxx',
    endpoint: "http://localhost:8000"
  });
}

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Apollo Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();
