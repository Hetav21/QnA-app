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
import { MessageInterface } from "@/model/Message";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosResponse } from "axios";
import { X } from "lucide-react";
import { ReplyMessage } from "./ReplyMessage";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

export function MessageCard({ message }: { message: MessageInterface }) {
  const { toast } = useToast();

  // Using the context to delete the message
  const { onMessageDeleteAction } = useMessageContext();

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

  // Calculating the time spent since message creation
  const dateTimeRightNow = new Date();
  const createdAt = new Date(message.createdAt);
  const timeSpent = Math.floor(
    (dateTimeRightNow.getTime() - createdAt.getTime()) / (1000 * 60),
  );

  const time =
    timeSpent > 24 * 60
      ? `${Math.floor(timeSpent / (24 * 60))} days ago`
      : Math.floor(timeSpent / 60) === 0
        ? `${timeSpent} minutes ago`
        : `${Math.floor(timeSpent / 60)} hours ago`;

  return (
    <Card>
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
      <CardContent className="text-xl pb-4 pr-2 mr-2">
        {message.content}
      </CardContent>
      {/* Show message reply only if reply exists */}
      {message.reply && message.reply !== "" && (
        <CardContent className="text-lg pb-4 pr-2 mr-2">
          <Separator />
          {message.reply}
        </CardContent>
      )}
      <ReplyMessage message={message} />
    </Card>
  );
}
