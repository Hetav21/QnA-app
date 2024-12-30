"use client";

import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { messageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosResponse } from "axios";
import { useParams } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export default function UserPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = useParams<{ username: string }>();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof messageSchema>> = async (
    data,
  ) => {
    setIsSubmitting(true);

    const result: AxiosResponse<ApiResponse> = await axios.post(
      "/api/send-message",
      {
        username: params.username,
        content: data.content,
      },
    );

    if (result.data.success) {
      if (
        result.data.data != null &&
        result.data.data.isAcceptingMessages != null &&
        result.data.data.isAcceptingMessages === false
      ) {
        toast({
          title: "User is not accepting messages",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Message sent successfully",
          description: "Your message has been sent successfully",
          variant: "default",
        });
      }
    } else {
      toast({
        title: "Error sending message",
        description: result.data.message,
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex justify-center items-center">
      <div className="mx-32 max-w-6xl w-full p-8 bg-white rounded-lg">
        <div className="flex-grow flex flex-col items-center justify-center md:px-12 py-6 text-black">
          <section className="text-center mb-8 md:mb-12">
            <h1 className="text-xl md:text-4xl font-bold">
              Send Feedback Annonymously
            </h1>
          </section>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="pl-1 font-bold text-lg">
                    Send message to u/{params.username}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your message here"
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              <Label>Send message now!!</Label>
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
