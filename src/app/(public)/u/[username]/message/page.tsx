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
import axios, { AxiosError, AxiosResponse } from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

export default function UserQuestionPage() {
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
    api: "/api/suggest-messages/" + params.username,
    initialCompletion: suggestedMessages,
    onError: (err) => {
      try {
        // Try parsing error message
        const error: ApiResponse = JSON.parse(err.message);
        toast({
          title: "Error fetching messages",
          description: error.message || "Failed to fetch messages",
          variant: "destructive",
        });
      } catch (err) {
        // In case of error
        toast({
          title: "Error fetching messages",
          description: "Failed to fetch messages",
          variant: "destructive",
        });
      }
    },
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
  });

  // To watch if the form content is changed
  // Used to disable the submit button if form content is empty
  const messageContent = form.watch("content");

  // Method to handle form submission
  const onSubmit: SubmitHandler<z.infer<typeof messageSchema>> = async (
    data,
  ) => {
    setIsSubmitting(true);
    try {
      // Send message and username to the backend
      const result: AxiosResponse<ApiResponse> = await axios.post(
        "/api/send-message",
        {
          username: params.username,
          content: JSON.stringify(data.content),
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
          form.reset({ ...form.getValues(), content: "" });
        }
      } else {
        // In case of faliure
        toast({
          title: "Error sending message",
          description: result.data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;

      // In case of error
      console.error("Error sending message: ", axiosError);
      toast({
        title: "Error sending message",
        description:
          axiosError.response?.data.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Method to handle Suggest Messages button
  const onSuggest = async () => {
    setIsSuggesting(true);

    try {
      const suggestions = await complete(
        prompt +
          "suggest something different from: " +
          completion +
          " and " +
          suggestedMessages,
      );

      // Setting new suggested messages
      // Only needed as a fall back in case
      // Api fails to return completions
      // otherwise completions are handled by useCompletion hook
      if (suggestions) setSuggestedMessages(suggestions);
    } catch (err) {
      console.error("Error fetching messages: " + err);
      // In case of error, suggested messages are static
      setSuggestedMessages(getStaticSuggestedMessages(numberOfMessages));
    } finally {
      setIsSuggesting(false);
    }
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
                    Send question to u/{params.username}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      {...field}
                      placeholder="Enter your message here"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting || !messageContent}>
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
                        form.setValue("content", message);
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
