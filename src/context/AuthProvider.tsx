"use client";
import { SessionProvider } from "next-auth/react";

// Session provider
// Wraps the entire app
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
