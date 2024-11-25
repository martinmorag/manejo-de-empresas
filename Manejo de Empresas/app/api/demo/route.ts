import { PrismaClient } from '@prisma/client';
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const demos = await prisma.usuarios.findMany();
    return NextResponse.json(demos);
  } catch (err: any) {
    console.error('Error fetching data:', err.message);
    return NextResponse.json({ error: err.message });
  }
}