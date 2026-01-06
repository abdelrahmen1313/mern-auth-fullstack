import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  isVerified : Boolean;
}

export interface CreatePersonDTO {
  fullName?: string;
  email: string;
  password: string;
}

const userSchema = new Schema(
  {
    fullName: {
      type: "string",
      default: function () {
        let randomN = Math.floor(Math.random() * 99999).toString();
        return `user+${randomN}`;
      },
    },
    email: {
      type: "string",
      unique: true,
      required: true,
    },
    password: {
      type: "string",
      required: true,
    },
    isVerified : {
      type : Boolean,
      default : false
    },
    verifiedAt : {
      type : Schema.Types.String,
      default : "null"
    },
    verificationAttempts : {
      type : "number",
      default : 0,
    }
  },
  {
    timestamps: true,
  }
);

const User = model<IUser>("User", userSchema);
export default User;
// NOTE, I'm thinking for creating my own models, with a db schema for mongodb (bson schema) to allow more flexibility