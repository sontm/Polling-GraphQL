import { mergeResolvers } from "merge-graphql-schemas";

import Poll from "./Poll/";
import Choice from "./Choice/";

const resolvers = [Poll, Choice];

export default mergeResolvers(resolvers);
