import { DefaultUser } from 'next-auth';
import { Session } from 'next-auth';

// export interface CustomUser extends NextAuthUser {
//   name: string;
//   email: string;
//   default_picture: string;
// }

interface CustomUser extends DefaultUser {
  id: string;
  name: string;
  email: string;
  default_picture: string;
}

// Augment the Session interface to include your custom user type
declare module 'next-auth' {
  interface Session {
    usuario: CustomUser; // Ensure the session user has the CustomUser type
  }
}

export interface ProfileData {
  default_picture : string;
}

export interface DropDownProps {
  session: Session;
}