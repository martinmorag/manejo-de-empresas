import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma'; // Adjust the path to your Prisma instance
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'; // Adjust the path to your NextAuth options
import { Decimal } from '@prisma/client/runtime/library';

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

        // Fetch all deudas for the given negocioId, including cliente name and venta date
        const deudas = await prisma.deudas.findMany({
            where: {
                venta: {
                    negocioid: negocioId, // Ensure deudas are related to ventas with the same negocioid
                },
            },
            include: {
                venta: {
                    select: {
                        created_at: true, // Include the date of the venta
                    },
                },
                cliente: {
                    select: {
                        name: true, // Include the client's name
                    },
                },
            },
        });

        return NextResponse.json(deudas);
    } catch (error) {
        console.error("Error fetching deudas:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}



export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Extract deudaId from the request URL
    const url = new URL(req.url);
    const deudaId = url.searchParams.get('id');

    if (!deudaId || !isValidUUID(deudaId)) {
      return NextResponse.json({ message: 'ID de deuda no válido' }, { status: 400 });
    }

    // Fetch the user's negocioid based on their email from the session
    const usuario = await prisma.usuarios.findUnique({
      where: { email: session.user?.email as string },
      select: { negocioid: true },
    });

    if (!usuario?.negocioid) {
      return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
    }

    // Fetch the deuda and the related venta
    const deuda = await prisma.deudas.findUnique({
      where: { id: deudaId },
      include: { venta: true },
    });

    if (!deuda) {
      return NextResponse.json({ message: 'Deuda no encontrada' }, { status: 404 });
    }

    // Check if the venta belongs to the user's negocio
    if (deuda.venta?.negocioid !== usuario.negocioid) {
      return NextResponse.json({ message: 'La deuda no pertenece a tu negocio' }, { status: 403 });
    }

    // Update the venta's balance_due to 0 and set the payment to the total
    await prisma.ventas.update({
      where: { id: deuda.venta_id as string },
      data: {
        balance_due: 0,
        payment: deuda.venta.total, // Assuming `total` is the field in ventas for the total amount
      },
    });

    // Delete the deuda
    await prisma.deudas.delete({
      where: { id: deudaId },
    });

    return NextResponse.json({ message: 'Deuda eliminada exitosamente y venta actualizada' }, { status: 200 });
  } catch (error) {
    console.error("Error deleting deuda:", error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}


function isValidUUID(uuid: string): boolean {
    const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return regex.test(uuid);
}