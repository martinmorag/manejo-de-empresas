import { authOptions } from "./authOptions";
import handleAuth from 'next-auth';

export const GET = handleAuth(authOptions);
export const POST = handleAuth(authOptions);
