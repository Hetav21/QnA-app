import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/User";
import authErrors from "@/static/authErrors.json";
import bcrypt from "bcryptjs";
import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      // Defining the credentials to be used for signing in
      credentials: {
        identifier: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // Authorize logic to validate the credentials
      async authorize(
        credentials: Record<"identifier" | "password", string> | undefined,
      ): Promise<User | null> {
        if (!credentials) {
          throw new Error("Invalid credentials provided");
        }

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
            return user as User;
          } else {
            // If password is incorrect
            throw new Error("Incorrect password");
          }
        } catch (err) {
          // Server side errors
          throw new Error(err as string);
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // If the user is signing in with credentials
      if (account?.provider === "credentials") {
        return true;
      }

      // If the user is signing in with Google
      if (account?.provider === "google") {
        try {
          // Waiting for db to connect
          await dbConnect();

          // Finding the user from db
          const dbUser = await UserModel.findOne({
            email: profile!.email,
          });

          // If the user is not found
          if (!dbUser) {
            const authError = authErrors.userNotFound;
            return `/auth/error?errCode=${authError.code}&errMessage=${encodeURIComponent(authError.message)}&url=${authError.redirectUrl}`;
          }

          // If the user is not verified
          if (!dbUser.isVerified) {
            const authError = authErrors.userNotVerified;
            return `/auth/error?errCode=${authError.code}&errMessage=${encodeURIComponent(authError.message)}&url=${authError.redirectUrl}/${dbUser.username}`;
          }

          // Adding new fields to the user
          user._id = dbUser._id?.toString();
          user.username = dbUser.username;
          user.isVerified = dbUser.isVerified;
          user.isAcceptingMessages = dbUser.isAcceptingMessages;

          // Return true on successful sign in
          return true;
        } catch (err) {
          // Server side errors
          console.error(err);
          const authError = authErrors.internalServerError;
          return `/auth/error?errCode=${authError.code}&errMessage=${encodeURIComponent(authError.message)}&url=${authError.redirectUrl}`;
        }
      }

      // If the user is not signing in with credentials or google
      const authError = authErrors.serverSideError;
      return `/auth/error?errCode=${authError.code}&errMessage=${encodeURIComponent(authError.message)}&url=${authError.redirectUrl}`;
    },
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
