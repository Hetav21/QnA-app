"use client";

import { MessageCardPublic } from "@/components/MessageCardPublic";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { MessageInterface } from "@/model/Message";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError, AxiosResponse } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function UserPage() {
  // Using the context to handle message state
  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Extracting username from the url params
  const params = useParams<{ username: string }>();

  const { toast } = useToast();

  // Method to fetch messages
  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);

      try {
        const response: AxiosResponse<ApiResponse> = await axios.get(
          `/api/get-messages/${params.username}`,
        );

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
    [setIsLoading, setMessages, toast, params],
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Creating a profile url to accept messages
  // Extracting username from session to create profile url
  const username = params.username;

  // Extracting base url from window location
  const url = new URL(window.location.href);
  const baseUrl = url.origin;
  // const baseUrl = `${window.location.protocol}//${window.location.host}`;

  // Creating a profile url
  const profileUrl = `${baseUrl}/u/${username}`;

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">Public Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Responses Link</h2>{" "}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button
            onClick={() => {
              copyToClipboard(profileUrl);
              toast({
                title: "Copied to clipboard",
                description: "Profile link has been copied to clipboard",
                variant: "default",
              });
            }}
          >
            Copy
          </Button>
        </div>
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
            <MessageCardPublic
              key={message._id!.toString()}
              message={message}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}
