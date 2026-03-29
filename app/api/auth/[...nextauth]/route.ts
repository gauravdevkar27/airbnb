//[...nextauth] → NextAuth owns it — handles login, logout, sessions, OAuth automatically

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from 'bcrypt';
import prisma from "@/app/libs/getPrismdb";


export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'email', type: 'text' },
                password: { label: 'password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error('Email and password are required.');
                }

                // ── 1. Find user ──────────────────────────────────────────────────

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email.toLowerCase().trim()
                    }
                });
                if (!user || !user?.password) {
                    throw new Error('Invalid email or password.');
                }

                // ── 2. Email verified gate ────────────────────────────────────────
                if (!user.email_verified) {
                    // Use a code the login UI can detect and show a resend-link button
                    throw new Error('EMAIL_NOT_VERIFIED');
                }


                // ── 3. Account status ─────────────────────────────────────────────
                if (user.status === 'banned') {
                    throw new Error('Your account has been suspended.');
                }
                if (user.status === 'inactive') {
                    throw new Error('Your account is inactive. Contact support.');
                }

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isCorrectPassword) {
                    throw new Error('Invalid email or password');
                }
                return {
                    id: user.user_id,
                    name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    image: user.profile_img,
                };
            }
        })
    ],


    // ── Session & JWT ─────────────────────────────────────────────────────────
    session: { strategy: 'jwt' },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = (user as any).user_id;
                token.email_verified = (user as any).email_verified;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).email_verified = token.email_verified;
            }
            return session;
        },
    },

    pages: {
        signIn: '/',
        error: '/',

    },
    debug: process.env.NODE_ENV === 'development',
    
    secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };