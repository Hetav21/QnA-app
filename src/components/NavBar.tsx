"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";

export function NavBar() {
  // Extracting session information
  const { data: session } = useSession();

  // const user = session?.user;

  // Initializing toast
  const { toast } = useToast();

  return (
    <nav className="p-4 md:p-6 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <Link
          className="text-2xl font-bold mb-4 md:mb-0"
          // Session based redirection
          href={session ? "/dashboard" : "/"}
        >
          Anonymous QnA
        </Link>
        {
          // Session based rendering of Login or Logout
          session ? (
            <>
              {/* <span className="mr-4">
              Welcome, {user?.username || user?.email}
            </span> */}
              <Button
                className="w-full md:w-auto"
                onClick={() => {
                  toast({
                    title: "Logged out",
                    description: "Logged out successfully",
                    variant: "default",
                  });
                  signOut();
                }}
              >
                <Label>Logout</Label>
              </Button>
            </>
          ) : (
            <Link href="/sign-in">
              <Button className="w-full md:w-auto">
                <Label>Login</Label>
              </Button>
            </Link>
          )
        }
      </div>
    </nav>
  );
}
