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

        // Get sales data grouped by product
        const result = await prisma.detalles_ventas.groupBy({
            by: ['productoid'],
            where: { venta: { negocioid: negocioId } },
            _sum: { price: true, quantity: true },
            _count: { id: true },
        });

        // Map to get product names and sales
        const productSales = await Promise.all(result.map(async (item) => {
            const product = await prisma.productos.findUnique({ where: { id: item.productoid } });
            const price = item._sum.price ? item._sum.price.toNumber() : 0;  // Convert Decimal to number
            const quantity = item._sum.quantity as number;  // Type assertion
            return {
                product_name: product?.name ?? 'Unknown',
                total_sales: price * quantity,
            };
        }));

        return NextResponse.json(productSales);
    } catch (error) {
        console.error("Error fetching sales by product:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}