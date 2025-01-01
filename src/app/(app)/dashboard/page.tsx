"use client";

import { MessageCard } from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { MessageInterface } from "@/model/Message";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError, AxiosResponse } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function Dashboard() {
  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);

  const { toast } = useToast();

  const handleDeleteMessage = (messageId: MessageInterface["id"]) => {
    // Filters out the message with the given message id
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  // Fetching the session
  const { data: session } = useSession();

  // Creating a form to handle accept messages status
  const form = useForm<z.infer<typeof acceptMessageSchema>>({
    resolver: zodResolver(acceptMessageSchema),
    defaultValues: {
      acceptMessages: session?.user?.isAcceptingMessages,
    },
  });

  const { register, watch, setValue } = form;

  const acceptMessages = watch("acceptMessages");

  // Fetching the accept messages status
  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response: AxiosResponse<ApiResponse> = await axios.get(
        "/api/accept-messages",
      );
      setValue(
        "acceptMessages",
        response.data.success
          ? response.data.data!.isAcceptingMessages!
          : false,
      );
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;
      console.error("Error in fetching messages stage: ", err);

      toast({
        title: "Error in fetching accept messages",
        description:
          axiosError.response?.data.message ||
          "Failed to fetch message settings",
        variant: "destructive",
      });

      setValue("acceptMessages", false);
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  // Method to fetch messages
  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);

      try {
        const response: AxiosResponse<ApiResponse> =
          await axios.get("/api/get-messages");

        setMessages(response.data.data?.messages || []);

        if (refresh) {
          toast({
            title: "Messages refreshed",
            description: "Messages have been refreshed",
            variant: "default",
          });
        }
      } catch (err) {
        const axiosError = err as AxiosError<ApiResponse>;
        console.error("Error in fetching messages stage: ", err);

        toast({
          title: "Error in fetching messages",
          description:
            axiosError.response?.data.message || "Failed to fetch messages",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setMessages, toast],
  );

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessage();
  }, [session, setValue, fetchAcceptMessage, fetchMessages]);

  const handleSwitchChange = async () => {
    try {
      const response: AxiosResponse<ApiResponse> = await axios.post(
        "/api/accept-messages",
        {
          acceptMessages: !acceptMessages,
        },
      );

      setValue("acceptMessages", !acceptMessages);

      toast({
        title: "Accept messages updated",
        description: response.data.message,
        variant: "default",
      });
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;
      console.error("Error in updating accept messages: ", err);
      toast({
        title: "Error in updating accept messages",
        description:
          axiosError.response?.data.message || "Failed to update messages",
        variant: "destructive",
      });
    }
  };

  // If no session found
  if (!session || !session.user) {
    return <div>Please Login</div>;
  }

  // Creating a profile url to accept messages
  // Extracting username from session to create profile url
  const { username } = session.user;

  // Extracting base url from window location
  const url = new URL(window.location.href);
  const baseUrl = url.origin;
  // const baseUrl = `${window.location.protocol}//${window.location.host}`;

  // Creating a profile url
  const profileUrl = `${baseUrl}/u/${username}`;

  // Method to copy the profile url to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);

    toast({
      title: "Copied to clipboard",
      description: "Your profile link has been copied to clipboard",
      variant: "default",
    });
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id!.toString()}
              message={message}
              onMessageDeleteAction={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}
