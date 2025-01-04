import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import NextAuth from "next-auth";
import { authOptions } from "@/libs/next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
