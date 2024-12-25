import mongoose, { Schema, Document } from "mongoose";
import { MessageInterface, MessageSchema } from "./Message";

// Regex for email validation
const emailRegex =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

// Type Interface for User
export interface UserInterface extends Document {
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isAcceptingMessages: boolean;
  messages: MessageInterface[];
}

// User Schema for MongoDB
const UserSchema: Schema<UserInterface> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    match: [emailRegex, "Please use valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifyCode: {
    type: String,
    required: [true, "Verification code is required"],
  },
  verifyCodeExpiry: {
    type: Date,
    default: Date.now,
    required: [true, "Verification code expiry is required"],
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
});

// User Model for MongoDB
// If model already exists, use it or create a new one
export const UserModel =
  (mongoose.models.User as mongoose.Model<UserInterface>) ||
  mongoose.model<UserInterface>("User", UserSchema);
