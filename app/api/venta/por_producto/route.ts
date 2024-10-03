import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'; 
import { prisma } from '@/app/lib/prisma'; 

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const usuario = await prisma.usuarios.findUnique({
            where: { id: session.user?.id as string },
            select: { negocioid: true },
        });

        if (!usuario?.negocioid) {
            return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
        }

        const negocioId = usuario.negocioid;

        const mostSoldProducts = await prisma.detalles_ventas.groupBy({
            by: ['productoid'],
            _sum: {
                price: true,      // Sum of the price to get total sales
                quantity: true,   // Sum of the quantity sold
            },
            where: {
                venta: {
                    negocioid: negocioId,
                },
            },
            orderBy: {
                _sum: {
                    price: 'desc',  // Order by total sales amount
                },
            },
            take: 10,  // Limit to the top 10 products
        });

        const productsWithSales = await Promise.all(
            mostSoldProducts.map(async (product) => {
                const productDetails = await prisma.productos.findUnique({
                    where: { id: product.productoid },
                });

                const totalSales = product._sum?.price?.toNumber() ?? 0;  // Ensure it's a number
                const totalQuantity = product._sum?.quantity ?? 0;        // Total quantity sold

                return {
                    product_id: product.productoid,
                    product_name: productDetails?.name,
                    total_sales: totalSales,   // Total sales amount
                    total_quantity: totalQuantity, // Total quantity sold
                };
            })
        );

        return NextResponse.json(productsWithSales);
    } catch (error) {
        console.error("Error fetching most sold products:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}