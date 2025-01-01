"use client";

import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { messageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosResponse } from "axios";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { sanitizeString } from "@/lib/sanitizeString";
import { getRandomNumbers } from "@/lib/randomizer";
import { staticSuggestedMessages } from "@/static/staticSuggestedMessages";

export default function UserPage() {
  // Handles textarea
  const [text, setText] = useState<string>("");

  // Handles main form submission button
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handles Suggest Messages button
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);

  // Handles suggested messages
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);

  // Creating toasts
  const { toast } = useToast();

  // To get the username from the URL
  const params = useParams<{ username: string }>();

  // Method to get random static suggested messages
  function getStaticSuggestedMessages(n: number): string[] {
    const res: string[] = [];

    const nums = getRandomNumbers(n, 0, staticSuggestedMessages.length);

    for (let i = 0; i < n; i++) {
      res.push(staticSuggestedMessages[nums[i]]);
    }

    return res;
  }

  // To convert LLM response string to array of strings
  function stringToArray(input: string): string[] {
    try {
      return JSON.parse(input).split("||");
    } catch (err) {
      if (err instanceof SyntaxError) {
        console.log("Caught a SyntaxError, attempting to convert to string.");
        return JSON.parse(String(input)).split("||"); // Fallback to string conversion
      } else return [];
    }
  }

  // Method to fetch suggested messages from the backend
  const getSuggestedMessages = async () => {
    try {
      // Fetch suggested messages from the backend
      const result: AxiosResponse<ApiResponse> = await axios.get(
        "/api/suggest-messages",
      );

      if (result.data.success) {
        // If the request is successful
        const { response } = JSON.parse(
          sanitizeString(result.data.data!.text!),
        );

        const sanitizedString = sanitizeString(response.split("\n")[2]);

        const res = stringToArray(sanitizedString);

        toast({
          title: "Messages suggested successfully",
          description: "Messages have been suggested successfully",
          variant: "default",
        });

        return {
          success: true,
          messages: res,
        };
      } else {
        // If the request is unsuccessful
        toast({
          title: "Error fetching suggested messages",
          description: result.data.message,
          variant: "destructive",
        });

        return {
          success: false,
          messages: [],
        };
      }
    } catch (err) {
      // In case of faliure
      console.error("Error in suggesting messages: " + err);
      toast({
        title: "Error fetching suggested messages",
        description: "An error occurred while fetching suggested messages",
        variant: "destructive",
      });
      return {
        success: false,
        messages: [],
      };
    }
  };

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

    const result: {
      success: boolean;
      messages: string[];
    } = await getSuggestedMessages();

    setSuggestedMessages(result.messages);

    setIsSuggesting(false);
  };

  // New Messages are suggested on page load
  // replaces default messages i.e []
  useEffect(() => {
    setSuggestedMessages(getStaticSuggestedMessages(3));
  }, []);

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
            {suggestedMessages.map((message, index) => {
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
            })}
          </CardContent>
          <div className="w-full flex justify-center pb-4">
            <Button onClick={onSuggest} disabled={isSuggesting}>
              Suggest new messages!!
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
