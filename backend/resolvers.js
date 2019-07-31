import { Cat } from "./models/Cat";
//var {Cat} = require("./models/Cat");

export const resolvers = {
  Query: {
    hello: () => "hi",
    cats: () => Cat.find()
  },
  Mutation: {
    createCat: async (_, { name }) => {
      console.log("createCat called")
      const kitty = new Cat({ name });
      await kitty.save();
      console.log(kitty)
      return kitty;
    }
  }
};
