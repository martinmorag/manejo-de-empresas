import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    try {
        const profile = await prisma.usuarios.findUnique({
            where: { id },
        });

        if (!profile) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(profile);
    } catch (err: any) {
        console.error('Error fetching data:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}