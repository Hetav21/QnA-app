"use client";

import { MessageInterface } from "@/model/Message";
import React, { createContext, ReactNode, useContext, useState } from "react";

// Define the context state interface
interface MessageContextState {
  messages: MessageInterface[];
  setMessages: React.Dispatch<React.SetStateAction<MessageInterface[]>>;
  onReplyMessageAction: (
    messageId: MessageInterface["id"],
    reply: MessageInterface["reply"],
  ) => void;
  onMessageDeleteAction: (messageId: MessageInterface["id"]) => void;
}

// Creating the context
const MessageContext = createContext<MessageContextState | undefined>(
  undefined,
);

// Defining the provider's props
interface MessageProviderProps {
  children: ReactNode;
}

// Creating the provider component
export const MessageProvider: React.FC<MessageProviderProps> = ({
  children,
}) => {
  const [messages, setMessages] = useState<MessageInterface[]>([]);

  // Method to handle message deletion
  // Is passed to the card component
  const onMessageDeleteAction = (messageId: MessageInterface["id"]) => {
    // Filters out the message with the given message id
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  // Define the Reply Message method
  const onReplyMessageAction = (
    messageId: MessageInterface["id"],
    reply: MessageInterface["reply"],
  ) => {
    setMessages(
      (prevMessages) =>
        prevMessages.map((message) =>
          message._id === messageId
            ? {
                ...message,
                reply,
              }
            : message,
        ) as MessageInterface[],
    );
  };

  return (
    <MessageContext.Provider
      value={{
        messages,
        setMessages,
        onReplyMessageAction,
        onMessageDeleteAction,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

// Custom hook to use the context
export const useMessageContext = (): MessageContextState => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessageContext must be used within a MessageProvider");
  }
  return context;
};
