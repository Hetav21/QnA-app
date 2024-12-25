import { Schema, Document } from "mongoose";

// Type Interface for Message
export interface MessageInterface extends Document {
  content: string;
  createdAt: Date;
}

// Message Schema for MongoDB
export const MessageSchema: Schema<MessageInterface> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
