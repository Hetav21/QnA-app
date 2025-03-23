"use client";

import { useToast } from "@/hooks/use-toast";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

export function NavBar() {
  // Extracting session information
  const { data: session } = useSession();

  // Initializing toast
  const { toast } = useToast();

  // Extracting current path of the website
  const path = usePathname();

  // State to manage navbar background on scroll
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="h-12"></div>
      <nav className="fixed top-0 left-0 z-50 bg-transparent w-full flex justify-center">
        <div className="border-2 border-black backdrop-blur-sm rounded-lg w-full mx-6 mt-3 px-6 py-2">
          <div className="flex flex-col mx-4 md:flex-row justify-between items-center">
            <Link
              // Session based redirection
              href={session ? "/dashboard" : "/"}
            >
              <Label className="text-2xl font-bold mb-4 md:mb-0">
                Anonymous QnA
              </Label>
            </Link>
            {
              // Session based rendering of Login or Logout
              session ? (
                <>
                  <Button
                    className="w-full md:w-auto"
                    onClick={(e: React.SyntheticEvent) => {
                      e.preventDefault();
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
                <div className="gap-3 w-full md:w-fit flex flex-col md:flex-row justify-between items-center">
                  <Link href="/sign-up">
                    <ButtonNew text="Sign Up" />
                  </Link>
                  {path === "/" && (
                    <Link href="/sign-in">
                      <ButtonNew text="Sign In" />
                    </Link>
                  )}
                </div>
              )
            }
          </div>
        </div>
      </nav>
    </>
  );
}

function ButtonNew({ text }: { text: string }) {
  return (
    <Button className="text-black bg-inherit hover:bg-black hover:text-white">
      <Label className="font-semibold text-lg">{text}</Label>
    </Button>
  );
}
