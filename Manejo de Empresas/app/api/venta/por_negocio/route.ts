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

        // Fetch sales data grouped by business
        const result = await prisma.ventas.groupBy({
            by: ['negocioid'],
            _sum: { total: true },
        });

        return NextResponse.json(result.map(item => ({
            business_id: item.negocioid,
            total_sales: item._sum.total ?? 0,
        })));
    } catch (error) {
        console.error("Error fetching sales per business:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}