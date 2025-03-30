import type { NextAuthOptions, User as NextAuthUser, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
import { prisma } from "./prisma";

// Define UserRole enum to match Prisma schema
export enum UserRole {
  ADMIN = "ADMIN",
  OWNER = "OWNER",
  STAFF = "STAFF"
}

export interface UserType {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  businessId?: string | null;
}

// Extend NextAuth's User type with our custom fields
declare module "next-auth" {
  interface User extends UserType {}
  interface Session {
    user: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends UserType {}
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/signin',
    signOut: '/',
    error: '/signin', // Error code passed in query string as ?error=
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
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
          businessId: user.businessId,
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
          role: user.role,
          businessId: user.businessId,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          businessId: token.businessId,
        },
      };
    },
  },
};
