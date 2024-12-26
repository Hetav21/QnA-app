import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      // Defining the credentials to be used for signing in
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // Authorize logic to validate the credentials
      async authorize(credentials: any): Promise<any> {
        // Waiting for db to connect
        await dbConnect();
        try {
          // Finding the user
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          // If no user found with the identifier
          if (!user) {
            throw new Error("No user found with this email");
          }

          // If the user found is not verified
          if (!user.isVerified) {
            throw new Error("Please verify your account before logging in");
          }

          // Checking if the password is correct
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (isPasswordCorrect) {
            // If password is correct
            return user;
          } else {
            // If password is incorrect
            throw new Error("Incorrect password");
          }
        } catch (err) {
          // Server side errors
          throw new Error(("Server side error: " + err) as string);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Adding new fields to the token
      if (user) {
        token._id = user._id?.toString(); // Convert Mongo ObjectId to string
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      // Adding new fields to the session
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
};
