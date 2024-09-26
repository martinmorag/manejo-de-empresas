import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

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

        const profileImageBase64 = profile.profile_image
        ? `${profile.profile_image}`
        : null;

        
        return NextResponse.json({
            ...profile,
            profile_image: profileImageBase64,
        });
    } catch (err: any) {
        console.error('Error fetching data:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}