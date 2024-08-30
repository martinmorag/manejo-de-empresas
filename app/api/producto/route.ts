import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/prisma';
import { z } from "zod";

const ProductSchema = z.object ({
    name: z.string().min(1, "Nombre es requerido"),
    description: z.string().min(1, "Descripción es requerida"),
    barcode: z.string().min(5, "El código de barras tiene que tener al menos 5 caracteres"), 
    price: z.number().positive("El precio debe ser mayor a 0")
})

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
            where: { email: session.user?.email as string },
            include: { negocio: true },
        });

        if (!usuario?.negocioid) {
            return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
        }

        // Check if a product with the same barcode already exists
        const existingProduct = await prisma.productos.findFirst({
            where: { barcode: parsedBody.barcode },
        });

        if (existingProduct) {
            return NextResponse.json({ message: 'El código de barras ya está en uso' }, { status: 400 });
        }

        // Create new product with the retrieved negocioid
        const newProduct = await prisma.productos.create({
            data: {
                name: parsedBody.name,
                description: parsedBody.description,
                barcode: parsedBody.barcode,
                price: parsedBody.price,
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
};


export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('id');

        if (!productId) {
            return NextResponse.json({ message: 'ID del producto es requerido' }, { status: 400 });
        }

        const requestBody = await req.json();
        const parsedBody = ProductSchema.parse(requestBody);

        // Fetch negocioid based on the logged-in user's email
        const usuario = await prisma.usuarios.findUnique({
            where: { email: session.user?.email as string },
            include: { negocio: true },
        });

        if (!usuario?.negocioid) {
            return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
        }

        // Fetch the existing product to check if it belongs to the user's negocio
        const product = await prisma.productos.findUnique({
            where: { id: productId },
        });

        if (!product || product.negocioid !== usuario.negocioid) {
            return NextResponse.json({ message: 'Producto no encontrado o no autorizado para actualizar' }, { status: 404 });
        }

        // Check if the new barcode is already in use by another product
        // Only perform this check if the barcode is being updated
        const barcodeChanged = product.barcode !== parsedBody.barcode;
        if (barcodeChanged) {
            const existingProductWithBarcode = await prisma.productos.findFirst({
                where: {
                    barcode: parsedBody.barcode,
                    NOT: { id: productId }, // Exclude the current product from the check
                },
            });

            if (existingProductWithBarcode) {
                return NextResponse.json({ message: 'El código de barras ya está en uso' }, { status: 400 });
            }
        }

        // Update the product
        const updatedProduct = await prisma.productos.update({
            where: { id: productId },
            data: {
                name: parsedBody.name,
                description: parsedBody.description,
                barcode: parsedBody.barcode,
                price: parsedBody.price,
            },
        });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
};




export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('id');

        if (!productId) {
            return NextResponse.json({ message: 'ID del producto es requerido' }, { status: 400 });
        }

        const usuario = await prisma.usuarios.findUnique({
            where: { email: session.user?.email as string },
            include: { negocio: true },
        });

        if (!usuario?.negocioid) {
            return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
        }

        // Verify if the product belongs to the user's negocio
        const product = await prisma.productos.findUnique({
            where: { id: productId },
        });

        if (!product || product.negocioid !== usuario.negocioid) {
            return NextResponse.json({ message: 'Producto no encontrado o no autorizado para eliminar' }, { status: 404 });
        }

        await prisma.productos.delete({
            where: { id: productId },
        });

        return NextResponse.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}





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

        // Fetch all products linked to the user's negocioid
        const products = await prisma.productos.findMany({
            where: { negocioid: usuario.negocioid },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
};