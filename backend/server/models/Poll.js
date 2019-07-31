import mongoose from "mongoose";
import { ObjectID } from "mongodb";

const Schema = mongoose.Schema;

ObjectID.prototype.valueOf = function() {
  return this.toString();
};

const PollSchema = new Schema({
  question: {
    type: String,
    required: true
  },
  choices: [
    {
      type: Schema.Types.ObjectId,
      ref: "Choice"
    }
  ]
});

export default mongoose.model("Poll", PollSchema);
