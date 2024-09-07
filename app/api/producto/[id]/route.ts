import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/app/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        console.log("Fetching session...");
        const session = await getServerSession(authOptions);

        if (!session) {
            console.log("No session found");
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        console.log("Session found, fetching user...");
        const usuario = await prisma.usuarios.findUnique({
            where: { email: session.user?.email as string },
            include: { negocio: true },
        });

        if (!usuario?.negocioid) {
            console.log("User has no negocioid");
            return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
        }

        const { id: productId } = params;
        console.log("Product ID from params:", productId);

        if (!productId) {
            console.log("No product ID provided");
            return NextResponse.json({ message: 'ID del producto no proporcionado' }, { status: 400 });
        }

        console.log("Fetching product...");
        const product = await prisma.productos.findFirst({
            where: { 
                id: productId,
                negocioid: usuario.negocioid 
            },
        });

        if (!product) {
            console.log("Product not found for ID:", productId);
            return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}