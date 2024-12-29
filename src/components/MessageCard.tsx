"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosResponse } from "axios";
import { MessageInterface } from "@/model/Message";
import { ApiResponse } from "@/types/ApiResponse";

export function MessageCard({
  message,
  onMessageDeleteAction,
}: {
  message: MessageInterface;
  onMessageDeleteAction: (messsageId: MessageInterface["_id"]) => void;
}) {
  const { toast } = useToast();

  const handleDeleteConfirm = async () => {
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

    onMessageDeleteAction(message._id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{message.createdAt.toString()}</CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
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
      <CardContent>{message.content}</CardContent>
    </Card>
  );
}
