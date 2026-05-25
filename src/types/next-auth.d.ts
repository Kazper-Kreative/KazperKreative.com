import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: string;
      sanityId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    sanityId?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
    sanityId?: string;
  }
}
