import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma'; // Adjust the path if needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Attempt to connect to the database
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ success: true, message: 'Connected to the database successfully!' });
  } catch (error : any) {
    res.status(500).json({ success: false, message: `Failed to connect to the database: ${error.message}` });
  }
}