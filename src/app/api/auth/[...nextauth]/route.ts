import { authOptions } from "@/lib/auth-options";
import NextAuth from "next-auth";

// defining handler for authentication using next-auth
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
