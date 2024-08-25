import NextAuth, { DefaultSession } from 'next-auth';

interface CustomUser extends DefaultUser {
  id: string;
  default_picture: string;
}

// Augment the Session interface to include your custom user type
declare module 'next-auth' {
  interface Session {
    user: CustomUser & DefaultSession['usuario']; // Merge with default user properties
  }

  interface User extends CustomUser {} // Extend the User interface with custom properties
}