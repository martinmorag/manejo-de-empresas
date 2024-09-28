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
            select: { negocioid: true, accesos_directos: true },
        });

        if (!usuario?.negocioid) {
            return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
        }

        return NextResponse.json(usuario.accesos_directos);
    } catch (error) {
        console.error("Error fetching ventas for the current month:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        // Parse the request body to get the new accesos_directos
        const { accesos_directos } = await req.json();

        // Ensure accesos_directos is provided
        if (!accesos_directos || typeof accesos_directos !== 'string') {
            return NextResponse.json({ message: 'accesos_directos is required and should be a string' }, { status: 400 });
        }

        // Update the user's accesos_directos in the database
        const updatedUsuario = await prisma.usuarios.update({
            where: { email: session.user?.email as string },
            data: { accesos_directos },
        });

        // Return the updated accesos_directos
        return NextResponse.json({ message: 'Accesos directos updated successfully', accesos_directos: updatedUsuario.accesos_directos });
    } catch (error) {
        console.error("Error updating accesos_directos:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}