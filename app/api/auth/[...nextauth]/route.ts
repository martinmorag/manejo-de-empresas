import NextAuth from 'next-auth';
import handleAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../../../lib/prisma'; // Adjust the path if needed
import bcrypt from 'bcrypt';
import type { NextAuthOptions } from 'next-auth';
import type { User as NextAuthUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';



interface CustomUser extends NextAuthUser {
  id: string;
}

interface CustomToken extends JWT {
  id?: string;
}


const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6), // Adjust the minimum length as needed
});


export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Credentials:', credentials);
      
        if (!credentials) {
          throw new Error('No se ingresaron credenciales');
        }

        const parsedCredentials = CredentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          throw new Error('Formato de ingreso no válido');
        }
      
        const user = await prisma.usuarios.findUnique({
          where: { email: credentials.email },
        });

      
        if (!user) {
          throw new Error('No se encontró usuario');
        }
        const storedPasswordHash = user.password.trim();
      
        const isValidPassword = await bcrypt.compare(credentials.password, storedPasswordHash);
            
        if (!isValidPassword) {
          throw new Error('Contraseña inválida');
        }
        return { 
          id: user.id.toString(), 
          name: user.name, 
          email: user.email,
          } as CustomUser;
      }       
    }),
  ],
  pages: {
    signIn: '/ingreso', // Custom sign-in page
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as CustomUser).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};


export const GET = handleAuth(authOptions);
export const POST = handleAuth(authOptions);

export default NextAuth(authOptions);