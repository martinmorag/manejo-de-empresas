import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/app/lib/prisma'; // Adjust the path if needed
import bcrypt from 'bcrypt';
import type { NextAuthOptions } from 'next-auth';
import type { RequestInternal } from 'next-auth';
import { NextApiRequest } from "next";
import type { User as NextAuthUser } from 'next-auth';
import { sendBlockWarning } from '@/app/lib/utils';
import { z } from 'zod';
import dayjs from 'dayjs';

const MAX_ATTEMPTS = 15;
const LOCK_TIME_MINUTES = 1;

interface CustomUser extends NextAuthUser {
  id: string;
}

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});




function getClientIp(req: NextApiRequest): string | null {
  // Check various headers that might contain the IP
  const forwardedFor = req.headers['x-forwarded-for'] as string | string[] | undefined;
  const realIp = req.headers['x-real-ip'] as string | undefined;
  const cfConnectingIp = req.headers['cf-connecting-ip'] as string | undefined;

  // Ensure forwardedFor is a string, if it's an array, take the first item
  let forwardedForIp: string | null = null;

  if (Array.isArray(forwardedFor)) {
    forwardedForIp = forwardedFor[0];  // Take the first IP from the array
  } else if (typeof forwardedFor === 'string') {
    forwardedForIp = forwardedFor.split(',')[0].trim();  // If it's a string, split and take the first IP
  }

  // Try different headers in order of reliability, ensuring they're all treated as strings
  const ip = forwardedForIp ||
      (typeof realIp === 'string' ? realIp : null) ||
      (typeof cfConnectingIp === 'string' ? cfConnectingIp : null) ||
      req.socket?.remoteAddress ||
      null;

  return ip;
}







export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials,
                      req: Pick<RequestInternal, "body" | "method" | "query" | "headers">) {

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
          await logLoginAttempt(null ?? undefined, email, false, 'Usuario no encontrado', req as NextApiRequest);
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
          await logLoginAttempt(user.id, email, false, 'Incorrect password', req as NextApiRequest);
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
    reason?: string,
    req?: NextApiRequest
) {
  if (!usuarioid) {
    console.error("No valid usuarioid provided, cannot log login attempt.");
    throw new Error("No se encontró un usuario");
  }

  if (!req) {
    throw new Error('Request is required for logging login attempt.');
  }

  const ipaddress = getClientIp(req);

  await prisma.login_attempts.create({
    data: {
      usuarioid: usuarioid, // Provide a default value if undefined
      success,
      ipaddress: ipaddress, // Optionally include IP address
      reason,
    },
  });
}