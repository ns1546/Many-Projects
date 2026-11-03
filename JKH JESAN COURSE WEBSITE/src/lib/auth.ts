 import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma as db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { withSelfHealing } from "@/lib/self-healing";

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

const providers: any[] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email or Phone", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("ইমেইল/ফোন নম্বর এবং পাসওয়ার্ড প্রদান করুন");
      }

      const rawInput = credentials.email.trim();
      const normalizedEmail = rawInput.toLowerCase();

      // Self-healing query with auto-retry
      const user = await withSelfHealing(async () => {
        return await db.user.findFirst({
          where: {
            OR: [
              { email: normalizedEmail },
              { phone: rawInput },
            ],
          },
        });
      });

      if (!user || !user.password) {
        throw new Error("এই ইমেইল বা ফোন নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি");
      }

      const isCorrectPassword = await bcrypt.compare(
        credentials.password,
        user.password
      );

      if (!isCorrectPassword) {
        throw new Error("ভুল পাসওয়ার্ড। দয়া করে সঠিক পাসওয়ার্ড দিন");
      }

      // 1. Check if user is banned
      if (user.isBanned) {
        throw new Error("BANNED: " + (user.banReason || "আপনার অ্যাকাউন্টটি সাসপেন্ড করা হয়েছে।"));
      }

      // 2. Generate Single-Device Active Session Token
      const activeSessionToken = crypto.randomUUID();
      try {
        await withSelfHealing(async () => {
          await db.user.update({
            where: { id: user.id },
            data: { activeSessionToken },
          });
        });
      } catch (e) {
        console.error("Failed to update activeSessionToken:", e);
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        sessionToken: activeSessionToken,
        isBanned: false,
      };
    },
  }),
];

// Configure Google OAuth Provider
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days persistent session
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const normalizedEmail = user.email.toLowerCase().trim();

        try {
          const existing = await withSelfHealing(async () => {
            return await db.user.findUnique({
              where: { email: normalizedEmail },
            });
          });

          if (existing) {
            if (existing.isBanned) {
              return false;
            }
            const activeSessionToken = crypto.randomUUID();
            await withSelfHealing(async () => {
              await db.user.update({
                where: { id: existing.id },
                data: { activeSessionToken },
              });
            });
            (user as any).sessionToken = activeSessionToken;
          } else {
            const count = await db.user.count();
            const activeSessionToken = crypto.randomUUID();
            await withSelfHealing(async () => {
              await db.user.create({
                data: {
                  id: crypto.randomUUID(),
                  name: user.name || "Student",
                  email: normalizedEmail,
                  image: user.image || null,
                  role: count === 0 ? "ADMIN" : "STUDENT",
                  activeSessionToken,
                  updatedAt: new Date(),
                },
              });
            });
            (user as any).sessionToken = activeSessionToken;
          }
        } catch (e) {
          console.error("Google sign-in auto-provisioning error:", e);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        try {
          const email = (user.email || token.email || "").toLowerCase().trim();
          if (email) {
            const dbUser = await db.user.findUnique({
              where: { email },
            });
            if (dbUser) {
              token.id = dbUser.id;
              token.role = dbUser.role || "STUDENT";
              token.sessionToken = (user as any).sessionToken || dbUser.activeSessionToken;
              token.isBanned = dbUser.isBanned || false;
              return token;
            }
          }
        } catch (e) {}

        token.id = user.id;
        token.role = (user as any).role || "STUDENT";
        token.sessionToken = (user as any).sessionToken;
        token.isBanned = (user as any).isBanned || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).sessionToken = token.sessionToken;
        (session.user as any).isBanned = token.isBanned;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "evorise-media-build-fallback-secret",
};
