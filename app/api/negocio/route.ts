import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'; // Adjust the import path as necessary
import { prisma } from '@/app/lib/prisma'; // Adjust the import path to your Prisma client

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        // Fetch the user's negocioid based on their email from the session
        const usuario = await prisma.usuarios.findUnique({
            where: { email: session.user?.email as string },
            include: { negocio: true },
        });

        if (!usuario?.negocioid) {
            return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
        }

        // Fetch the iva_percentage linked to the user's negocioid
        const negocio = await prisma.negocios.findUnique({
            where: { id: usuario.negocioid },
            select: { iva_percentage: true },
        });

        if (!negocio) {
            return NextResponse.json({ message: 'Negocio no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ iva_percentage: negocio.iva_percentage });
    } catch (error) {
        console.error("Error fetching IVA percentage:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
};