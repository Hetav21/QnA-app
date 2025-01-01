"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getRandomNumbers } from "@/lib/randomizer";
import { messageSchema } from "@/schemas/messageSchema";
import {
  numberOfMessages,
  prompt,
  specialCharacter,
} from "@/static/prompts/default";
import { staticSuggestedMessages } from "@/static/staticSuggestedMessages";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCompletion } from "ai/react";
import axios, { AxiosResponse } from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

export default function UserPage() {
  // Handles textarea
  const [text, setText] = useState<string>("");

  // Handles main form submission button
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handles Suggest Messages button
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);

  // Handles suggested messages
  const [suggestedMessages, setSuggestedMessages] = useState<string>("");

  // Creating toasts
  const { toast } = useToast();

  // To get the username from the URL
  const params = useParams<{ username: string }>();

  // Handles suggested messages
  const { completion, complete, error } = useCompletion({
    api: "/api/suggest-messages",
    initialCompletion: suggestedMessages,
  });

  // Method to get random static suggested messages
  function getStaticSuggestedMessages(n: number): string {
    let res: string = "";

    const nums = getRandomNumbers(n, 0, staticSuggestedMessages.length);

    for (let i = 0; i < n; i++) {
      res += staticSuggestedMessages[nums[i]];
      if (i < n - 1) res += specialCharacter;
    }

    return res;
  }

  // Form to extract message content and send it to the backend
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
    values: {
      content: text.trim(),
    },
  });

  // Method to handle form submission
  const onSubmit: SubmitHandler<z.infer<typeof messageSchema>> = async (
    data,
  ) => {
    setIsSubmitting(true);

    // Send message and username to the backend
    const result: AxiosResponse<ApiResponse> = await axios.post(
      "/api/send-message",
      {
        username: params.username,
        content: data.content,
      },
    );

    // Handle the response from the backend
    if (result.data.success) {
      // In case of successfull response
      if (
        result.data.data != null &&
        result.data.data.isAcceptingMessages != null &&
        result.data.data.isAcceptingMessages === false
      ) {
        // If the user is not accepting messages
        toast({
          title: "User is not accepting messages",
          variant: "destructive",
        });
      } else {
        // If the user is accepting messages
        toast({
          title: "Message sent successfully",
          description: "Your message has been sent successfully",
          variant: "default",
        });
      }
    } else {
      // In case of faliure
      toast({
        title: "Error sending message",
        description: result.data.message,
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  // Method to handle Suggest Messages button
  const onSuggest = async () => {
    setIsSuggesting(true);

    try {
      await complete(
        prompt + "suggest something different from: " + completion,
      );
    } catch (err) {
      console.error("Error fetching messages: " + err);
      // In case of error, suggested messages are static
      setSuggestedMessages(getStaticSuggestedMessages(numberOfMessages));
    }

    setIsSuggesting(false);
  };

  const parseCompletions = (completions: string): string[] => {
    return completions.split(specialCharacter);
  };

  // New Messages are suggested on page load
  // replaces default messages i.e []
  useEffect(() => {
    setSuggestedMessages(getStaticSuggestedMessages(numberOfMessages));
  }, []);

  return (
    <div className="flex justify-center items-center">
      <div className="mx-32 max-w-6xl w-full p-8 bg-white rounded-lg">
        <div className="flex-grow flex flex-col items-center justify-center md:px-12 py-6 text-black">
          <section className="text-center mb-8 md:mb-12">
            <h1 className="text-xl md:text-4xl font-bold">
              Send Questions Annonymously
            </h1>
          </section>
        </div>
        {/* Main form to handle messages and content */}
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
                      disabled={isSubmitting}
                      {...field}
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value);
                        field.onChange(e);
                      }}
                      placeholder="Enter your message here"
                      className="w-full"
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
        {/* Suggested Messages */}
        <Card className="mt-10">
          <CardTitle className="text-center m-8">Suggested Messages</CardTitle>
          <CardContent>
            {/* In case of error show static suggested messages, otherwise show completions */}
            {parseCompletions(!error ? completion : suggestedMessages).map(
              (message, index) => {
                return (
                  <Card className="m-2 hover:bg-gray-200" key={index}>
                    <CardContent
                      className="p-4 text-center"
                      onClick={() => {
                        setText((text) => {
                          if (text === "") return message;
                          return text + " " + message;
                        });
                      }}
                    >
                      <Label>{message}</Label>
                    </CardContent>
                  </Card>
                );
              },
            )}
          </CardContent>
          <div className="w-full flex justify-center pb-4">
            <Button onClick={onSuggest} disabled={isSuggesting}>
              Suggest messages!!
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
