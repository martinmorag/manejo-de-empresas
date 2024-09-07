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
            select: { negocioid: true },
        });

        if (!usuario?.negocioid) {
            return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
        }

        const negocioId = usuario.negocioid;

        // Get sales data grouped by payment method
        const result = await prisma.ventas.groupBy({
            by: ['payment_method'],
            where: { negocioid: negocioId },
            _sum: { payment: true },
        });

        return NextResponse.json(result.map(item => ({
            payment_method: item.payment_method,
            total_sales: item._sum.payment ?? 0,
        })));
    } catch (error) {
        console.error("Error fetching sales by payment method:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}