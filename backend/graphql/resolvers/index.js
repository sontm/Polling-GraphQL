import { mergeResolvers } from "merge-graphql-schemas";

import Poll from "./Poll/";
import User from "./User/";

const resolvers = [Poll, User];

export default mergeResolvers(resolvers);
