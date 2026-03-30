// types/next-auth.d.ts
// Extends NextAuth's built-in types so TypeScript knows about our custom fields

import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      image: string | null;
      email_verified: boolean;
      status: string;
      role: 'user' | 'admin';
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    first_name: string;
    last_name: string;
    email_verified: boolean;
    role: 'user' | 'admin';
    status: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    first_name: string;
    last_name: string;
    email_verified: boolean;
    status: string;
    role: 'user' | 'admin';
    picture: string | null;
  }
}