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
  FormMessage,
} from "@/components/ui/form";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { verifySchema } from "@/schemas/verifySchema";
import { REGEXP_ONLY_DIGITS } from "input-otp";

const VerificationPage = () => {
  // Router to route to new page
  const router = useRouter();

  // To extract username from the URL
  const params = useParams<{ username: string }>();

  // To show toast messages
  const { toast } = useToast();

  // form based on verify schema
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  // On form submit event
  const onSubmit: SubmitHandler<z.infer<typeof verifySchema>> = async (
    data,
  ) => {
    try {
      // Sending backend request to verify the user
      const response: AxiosResponse<ApiResponse> = await axios.post(
        "/api/verify-code",
        {
          username: params.username,
          code: data.code,
        },
      );

      // Show toast message based on response
      toast({
        title: response.data.success ? "Success" : "Error",
        description: response.data.success
          ? "Account verified! Please login now!!"
          : response.data.message,
        variant: response.data.success ? "default" : "destructive",
      });

      // Route to sign-in page if verification is successful
      if (response.data.success) {
        router.replace("/sign-in");
      }
    } catch (err) {
      // Parsing error as AxiosError
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
        <div className="text-center place-items-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        // Only accepts digits
                        pattern={REGEXP_ONLY_DIGITS}
                        {...field}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Get Verified!!</Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
