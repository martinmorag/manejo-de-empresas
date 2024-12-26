import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/app/lib/prisma'; // Adjust the path if needed
import bcrypt from 'bcrypt';
import type { NextAuthOptions } from 'next-auth';
import type { User as NextAuthUser } from 'next-auth';
import { sendBlockWarning } from '@/app/lib/utils';
import { z } from 'zod';
import dayjs from 'dayjs';

const MAX_ATTEMPTS = 2;
const LOCK_TIME_MINUTES = 1;

interface CustomUser extends NextAuthUser {
  id: string;
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

        const { email } = credentials;

        const user = await prisma.usuarios.findUnique({
          where: { email },
        });

        // const plainTextPassword = 'soyadministrador';  // This should be a securely entered password
        // const saltRounds = 10;  // Number of bcrypt salt rounds
        // const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
        // console.log("this is the pasword")
        // console.log(hashedPassword)
      
        if (!user) {
          await logLoginAttempt(null ?? undefined, email, false, 'Usuario no encontrado');
          throw new Error('No se encontró un usuario');
        }

        // Check for lockout
        const recentAttempts = await prisma.login_attempts.findMany({
          where: {
            usuarioid: user.id,
            attemptedat: {
              gte: dayjs().subtract(LOCK_TIME_MINUTES, 'minute').toDate(),
            },
          },
        });

        const failedAttempts = recentAttempts.filter((attempt) => !attempt.success);

        if (failedAttempts.length >= MAX_ATTEMPTS) {
          await sendBlockWarning(email);

          throw new Error(
              `Su cuenta esta temporalmente bloqueada. Por favor intente de nuevo en ${LOCK_TIME_MINUTES} minutos.`
          );
        }

        const storedPasswordHash = user.password.trim();
      
        const isValidPassword = await bcrypt.compare(credentials.password, storedPasswordHash);
            
        if (!isValidPassword) {
          await logLoginAttempt(user.id, email, false, 'Incorrect password');
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



// Helper function to log login attempts
async function logLoginAttempt(
    usuarioid: string | undefined,
    email: string,
    success: boolean,
    reason?: string
) {
  if (!usuarioid) {
    console.error("No valid usuarioid provided, cannot log login attempt.");
    throw new Error("No se encontró un usuario");
  }
  await prisma.login_attempts.create({
    data: {
      usuarioid: usuarioid, // Provide a default value if undefined
      success,
      ipaddress: null, // Optionally include IP address
      useragent: null, // Optionally include User-Agent
      reason,
    },
  });
}