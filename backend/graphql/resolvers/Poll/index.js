import Poll from "../../../server/models/Poll";
import Choice from "../../../server/models/Choice";

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

      return res.map(u => ({
        _id: u._id.toString(),
        question: u.question,
        choices: u.choices
      }));
    }
  },
  Mutation: {
    createPoll: async (parent, { poll }, context, info) => {
      const newPoll = await new Poll({
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

        return createdPoll;
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  },
  Poll: {
  }
};
