import Poll from "../../../server/models/Poll";
import User from "../../../server/models/User";

import { AuthenticationError } from "apollo-server-express";

require('dotenv').config()
var ldap = require('ldapjs');

const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')


function fetchLDAPUser(username, password) {
  return new Promise((resolve, reject) => {
    var client = ldap.createClient({
      url: process.env.LDAP_URL
    });
    client.bind('uid='+username+',' + process.env.LDAP_BN,
        password, function(err) {
      
      // res.on('read', function(result) {
      //   console.log('  Read status: ' + result.status);
      // });
      if (err) {
        console.log("----LDAP ERROR")
        return reject('LDAP Auth Error')
      } else {
        var opts = {
          //filter: '(|(telephoneNumber=%)(homePhone=%)(mobile=%))',
          attributes: ['uidNumber', 'uid', 'mail', 'cn', 'userPassword']
        };

        client.search('uid='+username+',' + process.env.LDAP_BN, 
        opts, function(err, res) {
          res.on('searchEntry', function(entry) {
            var userInfo = entry.object;
            // JSON.stringify(userInfo)
            if (!userInfo['userPassword']) {
              return reject('LDAP Invalid Authorization')
            }

            var logUser = {};
            var jwt = jsonwebtoken.sign(
              { id: userInfo['uidNumber'], username: userInfo['uid'] },
              process.env.JWT_SECRET,
              { expiresIn: '7d' }
            )
            logUser._id = userInfo['uidNumber'];
            logUser.username = userInfo['uid'];
            logUser.jwt = jwt;
            logUser.mail = userInfo['uid'];
            logUser.fullname = userInfo['cn'];
            
            // Logined OK
            resolve(logUser)
          });
          res.on('error', function(err) {
            console.error('    LDAP Search error: ' + err.message);
            return reject('LDAP Invalid Authorization')
          });
          res.on('end', function(result) {
            //console.log('    Search Result status: ' + result.status);
          });
        });
      }
    });
  });
}

function fetchLDAPUserNoPassword(username) {
  return new Promise((resolve, reject) => {
    var client = ldap.createClient({
      url: process.env.LDAP_URL
    });
    var opts = {
      //filter: '(|(telephoneNumber=%)(homePhone=%)(mobile=%))',
      attributes: ['uidNumber', 'uid', 'mail', 'cn']
    };

    client.search('uid='+username+',' + process.env.LDAP_BN, 
    opts, function(err, res) {
      res.on('searchEntry', function(entry) {
        var userInfo = entry.object;
        // JSON.stringify(userInfo)
        var logUser = {};
        logUser._id = userInfo['uidNumber'];
        logUser.username = userInfo['uid'];
        logUser.mail = userInfo['mail'];
        logUser.fullname = userInfo['cn'];
        
        // Logined OK
        resolve(logUser)
      });
      res.on('error', function(err) {
        console.error('    LDAP Search error: ' + err.message);
        return reject('  TSDV LDAP Invalid Authorization')
      });
      res.on('end', function(result) {
        //console.log('    Search Result status: ' + result.status);
      });
    });
  });
}

export default {
  Query: {
    login: async (parent, { username, password }, context, info) => {
      console.log ("Login Request:" + username + "," + password)
      console.log(process.env.USE_LDAP)
      if (process.env.USE_LDAP) {
        // Code using LDAP here 
        var logUser = null;
        var errStr = null;
        await fetchLDAPUser(username, password)
          .then(
            (_logUser) => {
              logUser = _logUser;
            },
            (_errStr) => {
              errStr = _errStr;
            }
          )
        
        console.log("[BE] Return point of User---")
        console.log(logUser)
        if (errStr && !logUser) {
          throw new AuthenticationError(errStr)
        } else {
          return logUser
        }
      } else {
        const logUser = await User.findOne({
          username: username
        }).exec();

        if (!logUser) {
          throw new AuthenticationError('No user with that User name')
        }
        console.log(logUser)

        const valid = await bcrypt.compare(password, logUser.passwordBcrypt)

        if (!valid) {
          throw new AuthenticationError('Incorrect password')
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
      }
    },
    // fetch the profile of currently authenticated user
    me: async (parent, args, {user}, info) => {
      // make sure user is logged in
      if (!user) {
        throw new AuthenticationError('[GROUP3] You are not authenticated!')
      }
      // user is authenticated
      console.log("   USER, ME by ID:" + user.name)
      // No need query DB here, return user
      if (process.env.USE_LDAP) {
        var logUser = null;
        var errStr = null;
        await fetchLDAPUserNoPassword(user.username)
          .then(
            (_logUser) => {
              logUser = _logUser;
            },
            (_errStr) => {
              errStr = _errStr;
            }
          )
        
        console.log("[BE] Return point of ME User---")
        console.log(logUser)
        if (errStr && !logUser) {
          throw new AuthenticationError(errStr)
        } else {
          return logUser
        }

      } else {
        return await User.findById(user.id)
      }
    },
    profile: async (parent,  { username}, {user}, info) => {
      // make sure user is logged in
      if (!user) {
        throw new AuthenticationError('[GROUP3] You are not authenticated!')
      }
      // user is authenticated
      console.log("   USER, Get Profile ID of " + username + ", From:" + user.name)
      // No need query DB here, return user
      if (process.env.USE_LDAP) {
        var logUser = null;
        var errStr = null;
        await fetchLDAPUserNoPassword(username)
          .then(
            (_logUser) => {
              logUser = _logUser;
            },
            (_errStr) => {
              errStr = _errStr;
            }
          )
        
        console.log("[BE] Return point of PROFILE User---")
        console.log(logUser)
        if (errStr && !logUser) {
          throw new AuthenticationError(errStr)
        } else {
          return logUser
        }

      } else {
        return await User.findById(user.id)
      }
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
