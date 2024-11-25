import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/app/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "No autorizado" }, { status: 401 });
        }

        const usuario = await prisma.usuarios.findUnique({
            where: { id: session.user?.id as string }
        })

        if (!usuario) {
            return NextResponse.json({ error: "No se encontró usuario" }, { status: 404 });
        }

        const profileImageBase64 = usuario.profile_image
        ? `${usuario.profile_image}`
        : null;

        
        return NextResponse.json({
            ...usuario,
            profile_image: profileImageBase64,
        });
    } catch (err: any) {
        console.error('Error fetching data:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}