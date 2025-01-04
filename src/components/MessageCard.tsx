"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { useMessageContext } from "@/context/MessageContext";
import { useToast } from "@/hooks/use-toast";
import { calculateTime } from "@/lib/calculateRelativeTime";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { displayMessage } from "@/lib/displayMessages";
import { parseMessage } from "@/lib/parseMessage";
import { MessageInterface } from "@/model/Message";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosResponse } from "axios";
import { X } from "lucide-react";
import { useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { ReplyMessage } from "./ReplyMessage";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

export function MessageCard({ message }: { message: MessageInterface }) {
  const { toast } = useToast();

  // Using the context to delete the message
  const { onMessageDeleteAction } = useMessageContext();

  const [isReplyPressed, setIsReplyPressed] = useState<boolean>(false);

  // Debouncing the copy to clipboard function
  const debouncedCopyToClipboard = useDebounceCallback((toCopy: string) => {
    copyToClipboard(toCopy);
    toast({
      title: "Copied to clipboard",
      variant: "default",
    });
  }, 500);

  // Method to confir before deletion
  const handleDeleteConfirm = async () => {
    // Sending backend request to delete message
    const response: AxiosResponse<ApiResponse> = await axios.delete(
      `/api/delete-message/${message._id}`,
    );

    toast({
      title: response.data.success
        ? "Message deleted successfully"
        : "Error deleting message",
      description: response.data.message,
      variant: response.data.success ? "default" : "destructive",
    });

    // Updating the context state
    onMessageDeleteAction(message._id);
  };

  const time = calculateTime(message.createdAt);

  return (
    <Card className="mb-auto">
      <CardHeader className="flex-row justify-between">
        <CardDescription className="content-center">
          <Label className="text-lg">{time}</Label>
        </CardDescription>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="self-center">
              <X className="w-5 h-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent
        onClick={() => {
          debouncedCopyToClipboard(parseMessage(message.content));
        }}
        className="text-xl pb-4 pr-2 mr-2"
      >
        {displayMessage(message.content)}
      </CardContent>
      {/* Show message reply only if reply exists */}
      {!isReplyPressed && message.reply && message.reply !== "" && (
        <CardContent
          onClick={() => {
            debouncedCopyToClipboard(parseMessage(message.reply));
          }}
          className="text-xl pb-4 pr-2 mr-2"
        >
          <Separator className="mb-4" />
          <div>{displayMessage(message.reply)}</div>
        </CardContent>
      )}
      <ReplyMessage
        isPressed={isReplyPressed}
        setIsPressed={setIsReplyPressed}
        message={message}
      />
    </Card>
  );
}
