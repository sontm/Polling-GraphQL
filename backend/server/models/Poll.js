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
  createdBy: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    required: false
  },
  expireDate: {
    type: Date,
    required: false
  },
  choices: [
    {
      text: {
        type: String,
        required: true
      },
      votes: [
        {
          username: {
            type: String,
            required: true
          }
        }
      ]
    }
  ]
});

export default mongoose.model("Poll", PollSchema);
