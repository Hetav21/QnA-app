"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import axios, { AxiosError, AxiosResponse } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { verifySchema } from "@/schemas/verifySchema";

const VerificationPage = () => {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof verifySchema>> = async (
    data,
  ) => {
    try {
      const response: AxiosResponse<ApiResponse> = await axios.post(
        "/api/verify-code",
        {
          username: params.username,
          code: data.code,
        },
      );

      toast({
        title: response.data.success ? "Success" : "Error",
        description: response.data.success
          ? "Account verified! Please login!!"
          : response.data.message,
        variant: response.data.success ? "default" : "destructive",
      });

      if (response.data.success) {
        router.replace("/sign-in");
      }
    } catch (err) {
      const error = err as AxiosError<ApiResponse>;

      console.error("Error verifying user: " + err);

      toast({
        title: "Verification error",
        description:
          `${error.response?.data.message}, Please try again later` ||
          "Internal server error, Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VerificationPage;
