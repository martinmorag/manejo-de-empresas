import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // Adjust the path if needed

export async function GET(req: NextRequest) {
  try {
    // Attempt to connect to the database
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ success: true, message: 'Connected to the database successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: `Failed to connect to the database: ${error.message}` }, { status: 500 });
  }
}