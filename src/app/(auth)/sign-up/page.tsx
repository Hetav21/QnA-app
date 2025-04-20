"use client";
import { Input } from "@/components/input-with-effects";
import { Label } from "@/components/label-with-effects";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { signUpSchema } from "@/schemas/signUpSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError, AxiosResponse } from "axios";
import { Loader2 } from "lucide-react";
import { Turnstile } from "next-turnstile";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import { z } from "zod";

const SignUpPage = () => {
  // username state to store username
  const [username, setUsername] = useState("");

  // usernameMessage state to store the ApiResponse for the username based on availability
  const [usernameMessage, setUsernameMessage] = useState<ApiResponse>({
    success: false,
    message: "",
  });

  // States to block events from happening while checking username and submitting form
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // To debounce the backend calls to check username availability
  const debounced = useDebounceCallback(setUsername, 500);

  // To navigate to the verify page after successful sign up
  const router = useRouter();

  // Custom form with username, email and password
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // Checking username availability with debounced calls
  useEffect(() => {
    const checkUniqueUsername = async () => {
      if (username) {
        setIsCheckingUsername(true);
        try {
          const response: AxiosResponse<ApiResponse> = await axios.get(
            `/api/check-unique-username?username=${username}`,
          );

          setUsernameMessage(response.data);
        } catch (err) {
          const axiosError = err as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data || {
              success: false,
              message: "Error checking username",
            },
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUniqueUsername();
  }, [username]);

  // To handle on submit events
  const onSubmit: SubmitHandler<z.infer<typeof signUpSchema>> = async (
    data,
  ) => {
    setIsSubmitting(true);
    try {
      const response: AxiosResponse<ApiResponse> = await axios.post(
        "/api/sign-up",
        data,
      );

      if (response.data.success) {
        toast.success("Verification email sent successfully");
      } else {
        toast.warning("Error", {
          description: response.data.message,
        });
      }

      if (response.data.success) {
        router.replace(`/verify/${username}`);
      }
    } catch (err) {
      console.error("Error in signing up user: " + err);

      const axiosError = err as AxiosError<ApiResponse>;
      toast.warning("User creation failed, Please try again later", {
        description: axiosError.response?.data.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-zinc-200">
      <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-800 dark:text-neutral-200">
            Join Us
          </h1>
          <p className="mt-2 max-w-sm mb-4 text-md text-neutral-600 dark:text-neutral-300">
            Sign up to start your anonymous adventure
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <LabelInputContainer>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="username"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // Debouncing the username updates
                          debounced(e.target.value);
                        }}
                      />
                    </FormControl>
                    {isCheckingUsername ? (
                      <Loader2 className="animate-spin"></Loader2>
                    ) : (
                      <Label
                        className={`font-medium text-sm ${usernameMessage.success === true ? "text-green-600" : "text-red-600"}`}
                      >
                        {usernameMessage.message}
                      </Label>
                    )}
                    <FormMessage />
                  </LabelInputContainer>
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <LabelInputContainer>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </LabelInputContainer>
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <LabelInputContainer>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="***********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </LabelInputContainer>
                </FormItem>
              )}
            />
            <FormField
              name="cfTurnstileResponse"
              render={() => (
                <FormItem>
                  <LabelInputContainer>
                    <FormControl>
                      <Turnstile
                        siteKey={process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY!}
                        // cf turnstile can be flexible or normal or compact
                        // @ts-expect-error-ignore
                        size="flexible"
                        theme="light"
                        retry="auto"
                        refreshExpired="auto"
                        // Returns dummy token in development
                        // Enabled by default,
                        // set to false, in case testing in production
                        // sandbox={false}
                        sandbox={process.env.NODE_ENV === "development"}
                        onError={() => {
                          toast.warning(
                            "Security check failed. Please try again.",
                          );
                        }}
                        onExpire={() => {
                          toast.warning(
                            "Security check expired. Please verify again.",
                          );
                        }}
                        onVerify={(token) => {
                          form.setValue("cfTurnstileResponse", token);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </LabelInputContainer>
                </FormItem>
              )}
            />
            <FormField
              name="acceptTerms"
              render={() => (
                <FormItem>
                  <LabelInputContainer>
                    <FormControl>
                      <Label className="flex gap-2">
                        <Checkbox
                          {...form.register("acceptTerms", { required: true })}
                          className="size-5"
                          onCheckedChange={(checked) => {
                            if (checked) {
                              form.setValue("acceptTerms", true);
                              toast.warning(
                                "Please read and accept the terms and conditions carefully",
                              );
                            } else {
                              form.setValue("acceptTerms", false);
                            }
                          }}
                        />
                        <div className="content-center">
                          Accept{" "}
                          <Link
                            className="underline text-blue-600 visited:text-purple-600"
                            href="/terms-of-use.html"
                          >
                            Terms and Conditions
                          </Link>
                        </div>
                      </Label>
                    </FormControl>
                    <FormMessage />
                  </LabelInputContainer>
                </FormItem>
              )}
            />

            <Button
              className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin">
                  Please Wait
                </Loader2>
              ) : (
                <div>Sign up &rarr;</div>
              )}
              <BottomGradient />
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

export default SignUpPage;
