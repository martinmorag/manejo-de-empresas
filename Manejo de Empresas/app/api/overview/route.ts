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
            where: { id: session.user?.id as string },
            select: { negocioid: true, name: true },
        });

        if (!usuario?.negocioid) {
            return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
        }

        const negocioId = usuario.negocioid;
        const userName = usuario.name;

        // Get the start and end of the current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);

        // Fetch total amount and quantity of ventas for the current month and the given negocioId
        const result = await prisma.ventas.aggregate({
            where: {
                negocioid: negocioId,
                created_at: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
            _sum: {
                payment: true,
                balance_due: true,
            },
            _count: {
                id: true,
            },
        });

        // Return the aggregated data
        return NextResponse.json({
            userName,
            totalAmount: result._sum.payment ?? 0,
            totalBalanceDue: result._sum.balance_due ?? 0, 
            quantityOfSales: result._count.id,
        });
    } catch (error) {
        console.error("Error fetching ventas for the current month:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}