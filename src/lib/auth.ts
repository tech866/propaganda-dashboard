import NextAuth from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '@/middleware/auth';

// Mock user data (in a real app, this would come from a database)
const mockUsers = [
  { 
    id: 'user-1', 
    email: 'test@example.com', 
    password: 'password123', 
    name: 'John Doe', 
    role: 'sales' as UserRole, 
    clientId: 'client-1' 
  },
  { 
    id: 'user-admin-1', 
    email: 'admin@example.com', 
    password: 'adminpassword', 
    name: 'Admin User', 
    role: 'admin' as UserRole, 
    clientId: 'client-1' 
  },
  { 
    id: 'user-ceo-1', 
    email: 'ceo@example.com', 
    password: 'ceopassword', 
    name: 'CEO User', 
    role: 'ceo' as UserRole, 
    clientId: 'client-agency' 
  },
];

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = mockUsers.find(
          u => u.email === credentials.email && u.password === credentials.password
        );

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clientId: user.clientId,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: JWT_SECRET,
    encode: async ({ secret, token }) => {
      const jwtClaims = {
        id: token?.id,
        email: token?.email,
        name: token?.name,
        role: token?.role,
        clientId: token?.clientId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      };
      return jwt.sign(jwtClaims, secret, { algorithm: 'HS256' });
    },
    decode: async ({ secret, token }) => {
      try {
        return jwt.verify(token as string, secret, { algorithms: ['HS256'] }) as any;
      } catch (error) {
        return null;
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.clientId = (user as any).clientId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.clientId = token.clientId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: JWT_SECRET,
};

export default NextAuth(authOptions);
