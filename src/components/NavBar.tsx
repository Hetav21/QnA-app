"use client";
import { useToast } from "@/hooks/use-toast";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

export function NavBar() {
  // Extracting session information
  const { data: session } = useSession();

  // Initializing toast
  const { toast } = useToast();

  // Extracting current path of the website
  const path = usePathname();

  return (
    <nav className="mx-auto w-full p-4 md:p-6 shadow-md">
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
            <div className="w-full md:w-fit flex flex-col md:flex-row justify-between items-center">
              <Link href="/sign-up">
                <Button className="w-full md:w-auto">
                  <Label>Sign Up</Label>
                </Button>
              </Link>
              {path === "/" && (
                <Link href="/sign-in">
                  <Button className="md:ml-6 w-full mt-2 md:mt-0 md:w-auto">
                    <Label>Sign In</Label>
                  </Button>
                </Link>
              )}
            </div>
          )
        }
      </div>
    </nav>
  );
}
