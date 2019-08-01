import Poll from "../../../server/models/Poll";
import User from "../../../server/models/User";

export default {
  Query: {
    login: async (parent, { username, password }, context, info) => {
      console.log ("Login Request:" + username + "," + password)
      const logUser = await User.findOne({
        username: username,
        password: password
      }).exec();

      console.log(logUser)
      if (logUser) {
        // Logined OK
        return logUser;
      } else {
        throw new Error("Invalid User or Password");
      }
      
    }
  },
  Mutation: {
    createUser: async (parent, { user }, context, info) => {

      // This will call Constructor of POLL below ?
      const newUser = await new User({
        // field in DB; "poll" is input
        username: user.username,
        password: user.password
      });
      try {
        // const result = await newPoll.save();
        const result = await new Promise((resolve, reject) => {
          newUser.save((err, res) => {
            err ? reject(err) : resolve(res);
          });
        });
        console.log("Create User OKKKK:")
        console.log(result)
        return result;
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  }
};
