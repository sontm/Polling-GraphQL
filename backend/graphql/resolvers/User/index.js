import Poll from "../../../server/models/Poll";
import User from "../../../server/models/User";

import { AuthenticationError } from "apollo-server-express";

require('dotenv').config()

const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')

export default {
  Query: {
    login: async (parent, { username, password }, context, info) => {
      console.log ("Login Request:" + username + "," + password)
      const logUser = await User.findOne({
        username: username
      }).exec();

      if (!logUser) {
        throw new AuthenticationError('[GROUP3] No user with that User name')
      }
      console.log(logUser)

      const valid = await bcrypt.compare(password, logUser.passwordBcrypt)

      if (!valid) {
        throw new AuthenticationError('[GROUP3] Incorrect password')
      }

      if (logUser) {
        var jwt = jsonwebtoken.sign(
          { id: logUser.id, username: logUser.username },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        )
        logUser.jwt = jwt;
        // Logined OK
        return logUser;
      } else {
        throw new AuthenticationError("[GROUP3] Invalid User or Password");
      }
      
    },
    // fetch the profile of currently authenticated user
    me: async (parent, args, {user}, info) => {
      // make sure user is logged in
      if (!user) {
        throw new AuthenticationError('[GROUP3] You are not authenticated!')
      }
      // user is authenticated
      return await User.findById(user.id)
    }
  },
  Mutation: {
    createUser: async (parent, { user }, context, info) => {

      // This will call Constructor of POLL below ?
      const newUser = await new User({
        // field in DB; "poll" is input
        username: user.username,
        password: user.password,
        passwordBcrypt: await bcrypt.hash(user.password, 10)
      });
      try {
        console.log(newUser)
        // const result = await newPoll.save();
        const result = await new Promise((resolve, reject) => {
          newUser.save((err, res) => {
            err ? reject(err) : resolve(res);
          });
        });
        console.log("Create User OKKKK:")
        
        // return json web token
        var jwt = jsonwebtoken.sign(
          { id: user.id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        )
        result.jwt = jwt;
        console.log(result)
        return result;
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  }
};
