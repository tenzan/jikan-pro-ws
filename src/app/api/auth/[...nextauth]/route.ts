import NextAuth from "next-auth";
import type { NextAuthOptions, User, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";

const prisma = new PrismaClient();

export enum UserRole {
  ADMIN = "ADMIN",
  OWNER = "OWNER",
  STAFF = "STAFF"
}

interface UserType {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  businessId?: string | null;
}

declare module "next-auth" {
  interface User extends UserType {}
  interface Session {
    user: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends UserType {}
}

const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<UserType | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { ownedBusiness: true },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          businessId: user.businessId || user.ownedBusiness?.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          businessId: user.businessId,
        };
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      if (!token.email) return session;
      
      return {
        ...session,
        user: {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string | null,
          role: token.role as UserRole,
          businessId: token.businessId as string | null,
        },
      };
    },
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
// Export Next.js API route handlers
export const GET = handler;
export const POST = handler;
