import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useMessageContext } from "@/context/MessageContext";
import { useToast } from "@/hooks/use-toast";
import { MessageInterface } from "@/model/Message";
import { replySchema } from "@/schemas/replySchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosResponse } from "axios";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export function ReplyMessage({
  isPressed,
  setIsPressed,
  message,
}: {
  isPressed: boolean;
  setIsPressed: React.Dispatch<React.SetStateAction<boolean>>;
  message: MessageInterface;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Using the context to update the message reply
  const { onReplyMessageAction } = useMessageContext();

  // Fetching the session
  const { data: session } = useSession();

  // Defining form with zod resolver
  const form = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      reply: message.reply || "",
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
          reply: data.reply,
        },
      );
      res.data.success = response.data.success;

      // Updating messages state
      onReplyMessageAction(message._id, data.reply);

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
      if (res.data.success) setIsPressed(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-5 ml-5">
          <div className="inline-flex w-full justify-between">
            <div>
              {!isPressed ? (
                <Button
                  type="button"
                  onClick={() => {
                    setIsPressed(true);
                  }}
                >
                  {message.reply ? "Edit Reply" : "Reply"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    setIsPressed(false);
                  }}
                >
                  <X />
                </Button>
              )}
            </div>
            {isPressed && (
              <Button className="mr-5" type="submit">
                Send Reply
              </Button>
            )}
          </div>

          {isPressed && (
            <FormField
              control={form.control}
              name="reply"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      className="mt-2 mr-5 w-[calc(100%-16px)]"
                      placeholder="Write your reply here"
                      {...field}
                    ></Textarea>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </form>
    </Form>
  );
}
