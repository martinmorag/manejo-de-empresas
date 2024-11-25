import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'; // Adjust the import path as necessary
import { prisma } from '@/app/lib/prisma'; // Adjust the import path to your Prisma client

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if the session is valid and contains the user's information
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        // Fetch the complete user information to get the negocioId
        const usuario = await prisma.usuarios.findUnique({
            where: {
                id: session.user.id,
            },
            select: {
                negocioid: true,  // Assuming negocioId is a field in your user model
            },
        });

        // Check if usuario or negocioId is not found
        if (!usuario || !usuario.negocioid) {
            return NextResponse.json({ message: 'Negocio no encontrado' }, { status: 404 });
        }

        // Fetch the negocio data using the negocioId from the user
        const negocio = await prisma.negocios.findUnique({
            where: {
                id: usuario.negocioid,
            },
        });

        // Check if negocio is found
        if (!negocio) {
            return NextResponse.json({ message: 'Negocio no encontrado' }, { status: 404 });
        }

        return NextResponse.json(negocio);
    } catch (error) {
        console.error("Error fetching negocio information:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
};