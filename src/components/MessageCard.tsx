"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useMessageContext } from "@/context/MessageContext";
import { useToast } from "@/hooks/use-toast";
import { calculateTime } from "@/lib/calculateRelativeTime";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { displayMessage } from "@/lib/displayMessages";
import { parseMessage } from "@/lib/parseMessage";
import { MessageInterface } from "@/model/Message";
import { replySchema } from "@/schemas/replySchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosResponse } from "axios";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useDebounceCallback } from "usehooks-ts";
import { z } from "zod";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";

export function MessageCard({
  message,
  isDeletingMessages,
  setDeleteMessageAction,
  selectAll,
}: {
  message: MessageInterface;
  isDeletingMessages: boolean;
  setDeleteMessageAction: (
    props: (ms: MessageInterface["_id"][]) => MessageInterface["_id"][],
  ) => void;
  selectAll: boolean;
  setSelectAllAction: (props: boolean) => void;
}) {
  const { toast } = useToast();

  const [check, setCheck] = useState<boolean>(false || selectAll);

  // State to manage the reply box
  const [isReplyPressed, setIsReplyPressed] = useState<boolean>(false);

  // Debouncing the copy to clipboard function
  const debouncedCopyToClipboard = useDebounceCallback((toCopy: string) => {
    copyToClipboard(toCopy);
    toast({
      title: "Copied to clipboard",
      variant: "default",
    });
  }, 500);

  // Evalutating the time of the message in human readable format
  const time = calculateTime(message.createdAt);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Using the context to update the message reply
  const { onReplyMessageAction } = useMessageContext();

  // Fetching the session
  const { data: session } = useSession();

  // Defining form with zod resolver
  const form = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      reply: message.reply !== "" ? parseMessage(message.reply) : message.reply,
    },
  });

  // Submit Handler for sending reply
  const onSubmit: SubmitHandler<z.infer<typeof replySchema>> = async (data) => {
    setIsSubmitting(true);
    const res = { data: { success: false } };
    try {
      // Backend request to send reply
      const response: AxiosResponse<ApiResponse> = await axios.post(
        `/api/reply-message`,
        {
          username: session?.user.username,
          messageId: message._id,
          reply: JSON.stringify(data.reply),
        },
      );
      res.data.success = response.data.success;

      // Updating messages state
      onReplyMessageAction(message._id, JSON.stringify(data.reply));

      toast({
        title: response.data.success
          ? "Reply sent successfully"
          : "Error sending reply",
        description: response.data.message,
        variant: response.data.success ? "default" : "destructive",
      });
    } catch (err) {
      toast({
        title: "Error sending reply",
        description: "An error occured while sending reply",
        variant: "destructive",
      });
      console.error("Error in sending reply: ", err);
    } finally {
      setIsSubmitting(false);
      // If backend request is successful, then close the reply box
      if (res.data.success) setIsReplyPressed(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="mb-auto">
          <CardHeader className="flex-row justify-between pt-3">
            <CardDescription className="content-center">
              <Label className="text-lg">{time}</Label>
            </CardDescription>
            {isDeletingMessages ? (
              <div className="flex justify-center">
                <div className="inline-flex w-full gap-6">
                  <div className="h-10 px-4 py-2">
                    <Checkbox
                      checked={check || selectAll}
                      disabled={selectAll}
                      onClick={() => {
                        if (!selectAll) {
                          setCheck(!check);
                        }
                      }}
                      onCheckedChange={(checked) => {
                        console.log(checked);
                        const msgId = message._id!.toString();
                        if (checked) {
                          setDeleteMessageAction((ms) => {
                            return [...ms, msgId];
                          });
                        } else {
                          setDeleteMessageAction((ms) => {
                            return ms.filter(
                              (m: MessageInterface["_id"]) => m != msgId,
                            );
                          });
                        }
                      }}
                      className="w-5 h-5"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex">
                <div className="inline-flex w-full gap-6">
                  {isReplyPressed && <Button type="submit">Send Reply</Button>}
                  <div>
                    {!isReplyPressed ? (
                      <Button
                        type="button"
                        onClick={() => {
                          setIsReplyPressed(true);
                        }}
                      >
                        {message.reply ? "Edit Reply" : "Reply"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => {
                          setIsReplyPressed(false);
                        }}
                      >
                        <X />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
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
        </Card>
        {isReplyPressed && (
          <FormField
            control={form.control}
            name="reply"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    disabled={isSubmitting}
                    className="mt-2"
                    placeholder="Write your reply here"
                    {...field}
                  ></Textarea>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </form>
    </Form>
  );
}
