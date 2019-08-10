import Poll from "../../../server/models/Poll";
import User from "../../../server/models/User";
import { AuthenticationError } from "apollo-server-express";
import { transformPoll } from "../merge";
const AWS = require('aws-sdk');
const config = require('../../../aws/config');
const uuidv4 = require('uuid/v4');

export default {
  Query: {
    poll: async (parent, { _id }, context, info) => {
      return await Poll.findOne({ _id }).exec();
    },
    polls: async (parent, args, context, info) => {
      if (process.env.USE_MONGO) {
        const res = await Poll.find({})
          .populate()
          .exec();

        // const relatedChoices = await new Choice({
        //     question: poll.question
        //   });
        console.log("All Polls---");
        //console.log(res)
        // return res.map(u => ({
        //   _id: u._id.toString(),
        //   question: u.question,
        //   choices: u.choices,
        //   createdBy: u.createdBy
        // }));
        return res;
      } else {
        // Using DynamoDB
        if (process.env.IS_PROD) {
          AWS.config.update(config.aws_remote_config);
        } else {
          AWS.config.update(config.aws_local_config);
        }
        const docClient = new AWS.DynamoDB.DocumentClient();

        var params = {
          TableName: 'polls',
        };
        let result = {}

        // Another way of Promise 
        //let items =  await docClient.scan(params).promise();
        //console.log(items.Items)

        result = await new Promise((resolve, reject) => {
          docClient.scan(params, function(err, data) {
             err ? reject(err) : resolve(data.Items);
           });
         });

         console.log("All Polls---");
         console.log(result)
         return result;
      }
    }
  },
  Mutation: {
    createFullPoll: async (parent, { pollWithChoices }, {user}, info) => {
      if (!user) {
        throw new AuthenticationError('[GROUP3] You are not authenticated to create Full Poll!')
      }
      console.log(">>creteFullPoll with Request");
      pollWithChoices.choices.forEach(c => {
        c.id = uuidv4();
      });
      console.log(pollWithChoices)
      console.log("<<creteFullPoll with Request");
      var createdDate = new Date()
      var expireDate = new Date(createdDate)
      expireDate.setHours(expireDate.getHours()+pollWithChoices.inHour);
      expireDate.setDate(expireDate.getDate()+pollWithChoices.inDay);
      expireDate.setMinutes(expireDate.getMinutes()+pollWithChoices.inMinute);
      
      console.log(" CreatedDate:" + createdDate, "," + expireDate)
      try {
        if (process.env.USE_MONGO) {
          // This will call Constructor of POLL below ?
          const newPoll = await new Poll({
            question: pollWithChoices.question,
            choices: pollWithChoices.choices,
            createdBy: pollWithChoices.createdBy,
            createdDate: createdDate,
            expireDate: expireDate
          });
          let createdPoll;

          // const result = await newPoll.save();
          const result = await new Promise((resolve, reject) => {
          newPoll.save((err, res) => {
              err ? reject(err) : resolve(res);
            });
          });

          createdPoll = transformPoll(result);
          console.log ("-->>createPoll created")
          console.log (createdPoll)
          console.log ("<<--createPoll created")

          return createdPoll;
        } else {
          // Using DynamoDB
          if (process.env.IS_PROD) {
            AWS.config.update(config.aws_remote_config);
          } else {
            AWS.config.update(config.aws_local_config);
          }
          const docClient = new AWS.DynamoDB.DocumentClient();

          var randomID = uuidv4();
          var params = {
            TableName: 'polls',
            Item: { // a map of attribute name to AttributeValue
              id: randomID,
              question: pollWithChoices.question,
              choices: pollWithChoices.choices,
              createdBy: pollWithChoices.createdBy,
              createdDate: createdDate.toString(),
              expireDate: expireDate.toString()
            }
          };
          const result = await new Promise((resolve, reject) => {
            docClient.put(params, function(err, data) {
              if (err)
                reject(err)
              else {
                // pass params to call back to get return result
                resolve(params.Item);
              }
            });
          });

          console.log ("-->>Poll  created")
          console.log (result)
          console.log ("<<--Poll created")
        }
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    createChoice: async (parent, { choice }, {user}, info) => {
      if (!user) {
        throw new AuthenticationError('[GROUP3] You are not authenticated to create choice!')
      }
      console.log ("createChoice called")
      try {
        // Find Poll by ID
        const ofPoll = await Poll.findById({_id: choice.poll});
      
        console.log (">>Found Poll of Choice:")

        let newChoice = {
          text: choice.text
        };
        ofPoll.choices.push(newChoice);
        console.log(ofPoll)
        console.log ("<< Found Poll of Choice:")
        const result = await new Promise((resolve, reject) => {
          ofPoll.save((err, res) => {
            err ? reject(err) : resolve(res);
          });
        });

        console.log (">>>> Result of saved Poll:")
        console.log(result);
        console.log(transformPoll(result));
        console.log ("<<<< Result of saved Poll:")

        return transformPoll(result);
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    createVote: async (parent, { vote }, {user}, info) => {
      if (!user) {
        throw new AuthenticationError('[GROUP3] You are not authenticated to create vote!')
      }
      console.log ("createVote called")
      try {
        // Find Poll by ID
        if (process.env.USE_MONGO) {
          const ofPoll = await Poll.findById({_id: vote.poll});
        
          console.log (">>Found Poll of Vote:choiceID:" + vote.choice)
          // FIrst, remove all Vote by that User 
          ofPoll.choices.forEach(function (item, index) {
            // Loop In REVERSE order and remove by slice
            if (item.votes) {
              for (var i=item.votes.length-1; i>=0; i--) {
                  if (item.votes[i].username == vote.username) {
                    item.votes.splice(i, 1);
                  }
              }
            }
          });

          // Then Re-add vote
          ofPoll.choices.forEach(function (item, index) {
            if (item && item._id == vote.choice) {
              item.votes.push({username: vote.username});
            }
          });
          console.log(ofPoll)
          console.log ("<< Found Poll of Vote:")
          

          const result = await new Promise((resolve, reject) => {
            ofPoll.save((err, res) => {
              err ? reject(err) : resolve(res);
            });
          });

          //console.log (">>>> Result of saved Poll:")
          //console.log(result);
        // console.log(transformPoll(result));
          //console.log ("<<<< Result of saved Poll:")

          return (result);
        } else {
          // Using DynamoDB
          if (process.env.IS_PROD) {
            AWS.config.update(config.aws_remote_config);
          } else {
            AWS.config.update(config.aws_local_config);
          }
  
          const docClient = new AWS.DynamoDB.DocumentClient();

          var params = {
            TableName: 'polls',
            Key: { // a map of attribute name to AttributeValue for all primary key attributes
                "id": vote.poll
            }
          };
          let ret = await docClient.get(params).promise();
          const ofPoll = ret.Item;
          console.log(ofPoll)

          // FIrst, remove all Vote by that User 
          ofPoll.choices.forEach(function (item, index) {
            // Loop In REVERSE order and remove by slice
            if (item.votes) {
              for (var i=item.votes.length-1; i>=0; i--) {
                  if (item.votes[i].username == vote.username) {
                    item.votes.splice(i, 1);
                  }
              }
            }
          });

          // Then Re-add vote
          ofPoll.choices.forEach(function (item, index) {
            if (!item.votes) {
              item.votes = [];
            }
            if (item && item.id == vote.choice) {
              item.votes.push({username: vote.username, id: uuidv4()});
            }
          });


          // Update to DB
          // we use UpdateItem for replace Whole record
          var params = {
            TableName: 'polls',
            // Item: { // a map of attribute name to AttributeValue
            //   id: ofPoll.id,
            //   question: ofPoll.question,
            //   choices: ofPoll.choices,
            //   createdBy: ofPoll.createdBy,
            //   createdDate: ofPoll.toString(),
            //   expireDate: ofPoll.toString()
            // }
            Item: ofPoll
          };
          const result = await new Promise((resolve, reject) => {
            docClient.put(params, function(err, data) {
              if (err)
                reject(err)
              else {
                // pass params to call back to get return result
                resolve(params.Item);
              }
            });
          });

          console.log (">>>> Result of saved Poll:")
          console.log(result);

          return result;
        }
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  }
  // ,
  // Poll: {
  //   choices: async ({ _id, question }, args, context, info) => {
  //     return await Choice.find({poll: _id});
  //   }
  // }
  // ,
  // Choice: {
  //   poll: async ({ poll }, args, context, info) => {
  //     console.log("[DBG] new Choice with poll ID:" + poll)
  //     return await Poll.findById({ _id: poll });
  //   }
  // }
};
