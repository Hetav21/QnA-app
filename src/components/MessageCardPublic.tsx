"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { calculateTime } from "@/lib/calculateRelativeTime";
import { MessageInterface } from "@/model/Message";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { copyToClipboard } from "@/lib/copyToClipboard";

export function MessageCardPublic({ message }: { message: MessageInterface }) {
  const time = calculateTime(message.createdAt);

  const { toast } = useToast();

  return (
    <Card>
      <CardHeader className="flex-row justify-between">
        <CardDescription className="content-center">
          <Label className="text-lg">{time}</Label>
        </CardDescription>
      </CardHeader>
      <CardContent
        onClick={() => {
          copyToClipboard(message.content);
          toast({
            title: "Copied to clipboard",
            variant: "default",
          });
        }}
        className="text-xl pb-4 pr-2 mr-2"
      >
        <Label className="text-xl underline">Question</Label>
        <Label className="text-xl">: </Label>
        {message.content}
      </CardContent>
      {message.reply && message.reply !== "" && (
        <CardContent
          onClick={() => {
            copyToClipboard(message.reply);
            toast({
              title: "Copied to clipboard",
              variant: "default",
            });
          }}
          className="text-lg pb-4 pr-2 mr-2"
        >
          <Separator className="mb-4" />
          <Label className="text-xl underline">Response</Label>
          <Label className="text-xl">: </Label>
          {message.reply}
        </CardContent>
      )}
    </Card>
  );
}
