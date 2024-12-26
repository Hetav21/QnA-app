import mongoose, { Schema, Document } from "mongoose";
import { MessageInterface, MessageSchema } from "./Message";
import { emailRegex, usernameRegex, passwordRegex } from "@/regex";

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
    match: [
      usernameRegex,
      "Username must only contain letters, numbers, and underscores",
    ],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    match: [emailRegex, "Email must be valid"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    match: [passwordRegex, "Password must be valid"],
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
