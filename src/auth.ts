import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { client } from "@/sanity/lib/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub,
    Google,
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // 1. Check if user exists in Sanity as Agent or Client
        const profile = await client.fetch(
          `*[_type in ["agent", "client"] && email == $email][0]`,
          { email: user.email }
        );

        if (profile) {
          token.role = profile._type.toUpperCase();
          token.sanityId = profile._id;
        } else {
          // If no profile found, we'll default to CLIENT for new signups
          // and create a record in Sanity later or during this flow
          token.role = "CLIENT";
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.role = token.role;
        session.user.sanityId = token.sanityId;
      }
      return session;
    },
  },
});
