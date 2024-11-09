import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';
import csv from 'csv-parser'; // Install csv-parser with `npm install csv-parser`
import { Readable } from 'stream';

const ProductSchema = z.object({
    nombre: z.string().min(1, "Nombre es requerido"),
    descripcion: z.string().min(1, "Descripción es requerida"),
    "codigo de barras": z.string().min(5, "El código de barras tiene que tener al menos 5 caracteres"),
    precio: z.number().positive("El precio debe ser mayor a 0"),
});

async function parseCSV(stream: Readable): Promise<any[]> {
    const results: any[] = [];
    return new Promise((resolve, reject) => {
        stream
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const requestBody = await req.json();
        const parsedBody = ProductSchema.parse(requestBody);

        // Fetch negocioid based on the logged-in user's email
        const usuario = await prisma.usuarios.findUnique({
            where: { id: session.user?.id as string },
            include: { negocio: true },
        });

        if (!usuario?.negocioid) {
            return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
        }

        // Check if a product with the same barcode already exists
        const existingProduct = await prisma.productos.findFirst({
            where: { barcode: parsedBody["codigo de barras"] },
        });

        if (existingProduct) {
            return NextResponse.json({ message: 'El código de barras ya está en uso' }, { status: 400 });
        }

        // Create new product with the retrieved negocioid
        const newProduct = await prisma.productos.create({
            data: {
                name: parsedBody.nombre,
                description: parsedBody.descripcion,
                barcode: parsedBody["codigo de barras"],
                price: parsedBody.precio,
                negocioid: usuario.negocioid,
            },
        });

        return NextResponse.json(newProduct);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}