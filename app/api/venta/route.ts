import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

// Define the schema for the request body
const VentaSchema = z.object({
  total: z.number().positive("El total debe ser mayor a 0"),
  payment_method: z.string().max(100).optional(),
  detalles_ventas: z.array(
    z.object({
      productoid: z.string().uuid("ID del producto debe ser un UUID"),
      quantity: z.number().int().positive("La cantidad debe ser mayor a 0"),
      price: z.number().positive("El precio debe ser mayor a 0"),
      iva_percentage: z.number().min(0).max(100).optional(),
      discount: z.number().min(0).max(100).optional(),
    })
  ).nonempty("Debe incluir al menos un detalle de venta")
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const requestBody = await req.json();
    const parsedBody = VentaSchema.parse(requestBody);

    // Fetch negocioId based on the logged-in user's email
    const usuario = await prisma.usuarios.findUnique({
      where: { email: session.user?.email as string },
      include: { negocio: true },
    });

    if (!usuario?.negocioid) {
      return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
    }

    // Create the venta record
    const newVenta = await prisma.ventas.create({
      data: {
        negocioid: usuario.negocioid,
        total: parsedBody.total,
        payment_method: parsedBody.payment_method,
      }
    });

    // Create detalles_ventas records
    const detallesVentas = await prisma.detalles_ventas.createMany({
      data: parsedBody.detalles_ventas.map(detail => ({
        ventaid: newVenta.id,
        productoid: detail.productoid,
        quantity: detail.quantity,
        price: detail.price,
        iva_percentage: detail.iva_percentage,
        discount: detail.discount,
      })),
    });

    // Fetch the created venta with detalles_ventas
    const createdVenta = await prisma.ventas.findUnique({
      where: { id: newVenta.id },
      include: { detalles_ventas: true }
    });

    return NextResponse.json(createdVenta);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}