"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { calculateTime } from "@/lib/calculateRelativeTime";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { MessageInterface } from "@/model/Message";
import { useDebounceCallback } from "usehooks-ts";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

export function MessageCardPublic({ message }: { message: MessageInterface }) {
  const time = calculateTime(message.createdAt);

  const debouncedCopyToClipboard = useDebounceCallback((toCopy: string) => {
    copyToClipboard(toCopy);
    toast({
      title: "Copied to clipboard",
      variant: "default",
    });
  }, 500);

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
          debouncedCopyToClipboard(message.content);
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
            debouncedCopyToClipboard(message.reply);
          }}
          className="text-xl pb-4 pr-2 mr-2"
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
