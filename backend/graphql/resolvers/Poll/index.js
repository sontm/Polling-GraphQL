import Poll from "../../../server/models/Poll";
import User from "../../../server/models/User";

import { transformPoll } from "../merge";

export default {
  Query: {
    poll: async (parent, { _id }, context, info) => {
      return await Poll.findOne({ _id }).exec();
    },
    polls: async (parent, args, context, info) => {
      const res = await Poll.find({})
        .populate()
        .exec();

      // const relatedChoices = await new Choice({
      //     question: poll.question
      //   });

      return res.map(u => ({
        _id: u._id.toString(),
        question: u.question,
        choices: u.choices
      }));
    }
  },
  Mutation: {
    createPoll: async (parent, { poll }, context, info) => {

      // This will call Constructor of POLL below ?
      const newPoll = await new Poll({
        // field in DB; "poll" is input
        question: poll.question
      });
      let createdPoll;
      try {
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
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    createFullPoll: async (parent, { pollWithChoices }, context, info) => {
      console.log(">>creteFullPoll with Request");
      console.log(pollWithChoices)
      console.log("<<creteFullPoll with Request");
      // This will call Constructor of POLL below ?
      const newPoll = await new Poll({
        // field in DB; "poll" is input
        question: pollWithChoices.question,
        choices: pollWithChoices.choices
      });
      let createdPoll;
      try {
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
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    createChoice: async (parent, { choice }, context, info) => {
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
    createVote: async (parent, { vote }, context, info) => {
      console.log ("createVote called")
      try {
        // Find Poll by ID
        const ofPoll = await Poll.findById({_id: vote.poll});
      
        console.log (">>Found Poll of Vote:choiceID:" + vote.choice)
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
