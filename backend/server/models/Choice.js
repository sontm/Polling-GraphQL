import mongoose from "mongoose";
import { ObjectID } from "mongodb";

const Schema = mongoose.Schema;

ObjectID.prototype.valueOf = function() {
  return this.toString();
};

const ChoiceSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  poll: {
    type: Schema.Types.ObjectId,
    ref: "Poll"
  }
});

export default mongoose.model("Choice", ChoiceSchema);
