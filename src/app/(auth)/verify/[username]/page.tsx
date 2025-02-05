"use client";
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
import { useToast } from "@/hooks/use-toast";
import { verifySchema } from "@/schemas/verifySchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError, AxiosResponse } from "axios";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const VerificationPage = () => {
  // To handle the submitting state of the form
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Router to route to new page
  const router = useRouter();

  // To extract username from the URL
  const params = useParams<{ username: string }>();

  // To extract otp from the URL
  const searchParams = useSearchParams();
  const otp = searchParams.get("otp") || "";

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
    setIsSubmitting(true);

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
          ? "Account verified, Please login now!"
          : response.data.message,
        variant: response.data.success ? "default" : "destructive",
      });

      // Route to sign-in page if verification is successful
      if (response.data.success) {
        router.replace("/sign-in");
      }

      // Reset the form if the code is incorrect
      // Replacing the url, so as to avoid
      // getting the same error on page refresh
      if (response.data.data?.shouldReset) {
        router.replace(`/verify/${params.username}`);
        form.reset();
      }
    } catch (err) {
      // Parsing error as AxiosError
      const error = err as AxiosError<ApiResponse>;

      console.error("Error verifying user: " + err);

      toast({
        title: "Error",
        description:
          `${error.response?.data.message}` ||
          "Internal server error, Please try again later",
        variant: "destructive",
      });

      // Reset the form if the code if needed
      // Replacing the url, so as to avoid
      // getting the same error on page refresh
      if (error.response?.data.data?.shouldReset) {
        router.replace(`/verify/${params.username}`);
        form.reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (otp && otp.length === 6) {
      form.setValue("code", otp);

      onSubmit({
        code: otp,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

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
                      <div className="flex justify-center">
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
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin">
                    Verifying
                  </Loader2>
                ) : (
                  "Get Verified"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
