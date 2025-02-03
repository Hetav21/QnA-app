"use client";
import { useToast } from "@/hooks/use-toast";
import { signUpSchema } from "@/schemas/signUpSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError, AxiosResponse } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useDebounceCallback } from "usehooks-ts";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Turnstile } from "next-turnstile";
import { Checkbox } from "@/components/ui/checkbox";

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

  // Creating toasts
  const { toast } = useToast();

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

      toast({
        title: response.data.success ? "Success" : "Error",
        description: response.data.message,
        variant: "default",
      });

      if (response.data.success) {
        router.replace(`/verify/${username}`);
      }
    } catch (err) {
      console.error("Error in signing up user: " + err);

      const axiosError = err as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          `${axiosError.response?.data.message} Please try again later` ||
          "Internal server error, Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-zinc-200">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Us!!
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
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
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="***********"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="cfTurnstileResponse"
              render={() => (
                <FormItem>
                  <FormControl>
                    <Turnstile
                      siteKey={process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY!}
                      // @ts-ignore
                      // cf turnstile can be flexible or normal or compact
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
                        toast({
                          title: "Error",
                          description:
                            "Security check failed. Please try again.",
                          variant: "destructive",
                        });
                      }}
                      onExpire={() => {
                        toast({
                          title: "Error",
                          description:
                            "Security check expired. Please verify again.",
                          variant: "destructive",
                        });
                      }}
                      onVerify={(token) => {
                        form.setValue("cfTurnstileResponse", token);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="acceptTerms"
              render={() => (
                <FormItem>
                  <FormControl>
                    <Label className="flex gap-2">
                      <Checkbox
                        {...form.register("acceptTerms", { required: true })}
                        className="size-5"
                        onCheckedChange={(checked) => {
                          if (checked) {
                            form.setValue("acceptTerms", true);
                            toast({
                              title: "Terms and Conditions",
                              description:
                                "By clicking on the checkbox, you are agreeing to our terms and conditions",
                            });
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
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin">
                  Please Wait
                </Loader2>
              ) : (
                "Sign up"
              )}
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

export default SignUpPage;
