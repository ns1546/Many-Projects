import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "evorise-media-build-fallback-secret";
}

if (!process.env.NEXTAUTH_URL) {
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  } else if (process.env.NEXT_PUBLIC_APP_URL) {
    process.env.NEXTAUTH_URL = process.env.NEXT_PUBLIC_APP_URL;
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
