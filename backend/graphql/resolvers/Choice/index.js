import Poll from "../../../server/models/Poll";
import Choice from "../../../server/models/Choice";

export default {
  Query: {
    choice: async (parent, { _id }, context, info) => {
      return await Choice.find({ _id });
    },
    choices: async (parent, args, context, info) => {
      const res = await Choice.find({})
        .populate()
        .exec();

      return res.map(u => ({
        _id: u._id.toString(),
        text: u.text,
        poll: u.poll
      }));
    }
  },
  Mutation: {
    createChoice: async (parent, { choice }, context, info) => {
      const newChoice = await new Choice({
        text: choice.text,
        poll: choice.poll
      });

      return new Promise((resolve, reject) => {
        newChoice.save((err, res) => {
          err ? reject(err) : resolve(res);
        });
      });
    }
  },
  Choice: {
    poll: async ({ poll }, args, context, info) => {
      console.log("[DBG] new Choice with poll ID:" + poll)
      return await Poll.findById({ _id: poll });
    }
  }
};
