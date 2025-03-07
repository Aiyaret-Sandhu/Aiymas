import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { AuthOptions } from 'next-auth';
import crypto from 'crypto';

const generateStrongPassword = () => {
  return crypto.randomBytes(16).toString('hex');
};

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error('User not found');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          isNewGoogleUser: false,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            const generatedPassword = generateStrongPassword();
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);
            
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              password: hashedPassword,
              username: user.email?.split('@')[0] || 'user',
              lastLogin: new Date(),
              loginHistory: [{
                timestamp: new Date(),
                action: 'signup-google'
              }],
              generatedPassword: generatedPassword, // Store temporarily
              isNewGoogleUser: true
            });
            
            user.id = newUser._id.toString();
            user.isNewGoogleUser = true;
            user.generatedPassword = generatedPassword;
          } else {
            user.id = existingUser._id.toString();
            user.isNewGoogleUser = false;
          }
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isNewGoogleUser = user.isNewGoogleUser;
        token.generatedPassword = user.generatedPassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isNewGoogleUser = token.isNewGoogleUser as boolean;
        session.user.generatedPassword = token.generatedPassword as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };