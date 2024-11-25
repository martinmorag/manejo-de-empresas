import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/app/lib/prisma'; 
import { z } from "zod";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        // Fetch the user's negocioid based on their email from the session
        const usuario = await prisma.usuarios.findUnique({
            where: { id: session.user?.id as string },
            select: { negocioid: true },
        });

        if (!usuario?.negocioid) {
            return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
        }

        const negocioId = usuario.negocioid;
        const { id } = params; // Extract the id from the route parameters
        console.log("the venta id from get")
        console.log(id)

        // Fetch the venta by id for the given negocioId
        const venta = await prisma.ventas.findFirst({
            where: { 
                id,
                negocioid: negocioId
            },
            include: {
                detalles_ventas: true, // Include detalles_ventas if needed
            },
        });

        if (!venta) {
            return NextResponse.json({ message: 'Venta no encontrada' }, { status: 404 });
        }

        return NextResponse.json(venta);
    } catch (error) {
        console.error("Error fetching venta:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}


const UpdateVentaSchema = z.object({
    id: z.string().uuid("ID de venta debe ser un UUID"),
    payment: z.number().positive("El total debe ser mayor a 0").optional(),
    payment_method: z.string().max(100).optional(),
    clienteid: z.string().uuid("ID del cliente debe ser un UUID").optional(),
    is_on_credit: z.boolean().optional(),
    deuda_amount: z.number().min(0, "El monto de deuda debe ser mayor o igual a 0").optional(),
    due_date: z.string().nullable().optional(),
    total: z.number().positive(),
    detalles_ventas: z.array(
      z.object({
        id: z.string().uuid("ID del detalle debe ser un UUID").optional(),
        productoid: z.string().uuid("ID del producto debe ser un UUID"),
        productname: z.string(),
        quantity: z.number().int().positive("La cantidad debe ser mayor a 0"),
        price: z.number().positive("El precio debe ser mayor a 0"),
        iva_percentage: z.number().min(0).max(100).optional(),
        discount: z.number().min(0).max(100).optional(),
      })
    ).optional()
});




export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
  
    try {
      const session = await getServerSession(authOptions);
  
      if (!session) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
      }
      
      const requestBody = await req.json();
      try {
        const parsedBody = UpdateVentaSchema.parse(requestBody);
  
        // Fetch negocioId based on the logged-in user's email
        const usuario = await prisma.usuarios.findUnique({
          where: { id: session.user?.id as string },
          select: { negocioid: true },
        });
  
        if (!usuario?.negocioid) {
          return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
        }
  
        // Ensure cliente_id is a valid string
        if (!parsedBody.clienteid) {
          return NextResponse.json({ message: 'Cliente ID es requerido' }, { status: 400 });
        }

        // Update the venta record
        const updatedVenta = await prisma.ventas.update({
          where: { id: id }, // Use ventaId from the URL
          data: {
            payment: parsedBody.payment,
            payment_method: parsedBody.payment_method,
            clienteid: parsedBody.clienteid,
            total: parsedBody.total,
            balance_due: parsedBody.is_on_credit ? parseFloat(parsedBody.deuda_amount?.toString() || '0') : 0,
            status: parsedBody.is_on_credit ? 'Pagado Parcialmente' : 'Pagado',
          },
        });
        console.log("Detalles Ventas Data:", parsedBody.detalles_ventas);

        if (parsedBody.detalles_ventas) {
            await Promise.all(
            parsedBody.detalles_ventas.map(async (detail) => {
                if (detail.id) {
                // Ensure the ID exists before updating
                const existingDetail = await prisma.detalles_ventas.findUnique({
                    where: { id: detail.id },
                });
                console.log(`Detail ID ${detail.id} existence:`, existingDetail);

                if (existingDetail) {
                    // Update existing detalle_venta
                    await prisma.detalles_ventas.update({
                    where: { id: detail.id },
                    data: {
                        productoid: detail.productoid,
                        quantity: detail.quantity,
                        price: detail.price,
                        iva_percentage: detail.iva_percentage || 0,
                        discount: detail.discount || 0,
                    },
                    });
                } else {
                    // Handle case where detail.id does not exist
                    console.error(`Detail ID ${detail.id} does not exist.`);
                }
                } else {
                    console.log("creating new detalles")
                // Create new detalle_venta if no ID is provided
                await prisma.detalles_ventas.create({
                    data: {
                    ventaid: updatedVenta.id,
                    productoid: detail.productoid,
                    quantity: detail.quantity,
                    price: detail.price,
                    iva_percentage: detail.iva_percentage || 0,
                    discount: detail.discount || 0,
                    productname: detail.productname
                    },
                });
                }
            })
            );
        }
        
  
        // Handle deuda logic based on balance_due
        if (parsedBody.is_on_credit && parseFloat(parsedBody.deuda_amount?.toString() || '0') > 0) {
          const existingDeuda = await prisma.deudas.findFirst({
            where: {
              cliente_id: parsedBody.clienteid,
              venta_id: updatedVenta.id,
            },
          });
  
          await prisma.deudas.upsert({
            where: { id: existingDeuda?.id || '' }, // Ensure proper handling with a fallback
            update: {
              amount: parseFloat(parsedBody.deuda_amount?.toString() || '0'),
              due_date: parsedBody.due_date ? new Date(parsedBody.due_date) : null,
            },
            create: {
              cliente_id: parsedBody.clienteid,
              venta_id: updatedVenta.id,
              amount: parseFloat(parsedBody.deuda_amount?.toString() || '0'),
              due_date: parsedBody.due_date ? new Date(parsedBody.due_date) : null,
              status: 'Activo',
            },
          });
        } else {
          // If the sale is paid fully or deuda_amount is 0, remove any existing deuda record
          await prisma.deudas.deleteMany({
            where: {
              cliente_id: parsedBody.clienteid,
              venta_id: updatedVenta.id,
            },
          });
        }
  
        // Fetch the updated venta with detalles_ventas
        const updatedVentaWithDetails = await prisma.ventas.findUnique({
          where: { id: updatedVenta.id },
          include: { detalles_ventas: true },
        });
  
        return NextResponse.json(updatedVentaWithDetails);
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            console.error('Zod Validation Errors:', error.errors);
            return NextResponse.json({ errors: error.errors }, { status: 400 });
        }
    
        if (error instanceof Error) {
            console.error('Unexpected Error:', error);
            return NextResponse.json({ message: 'Unexpected server error', details: error.message }, { status: 500 });
        }
    
        // Handle cases where error is neither ZodError nor an instance of Error
        console.error('Unknown Error:', error);
        return NextResponse.json({ message: 'Unknown server error' }, { status: 500 });
        }
    } catch (error) {
      console.error('Server error:', error);
      return NextResponse.json({ message: 'Error en el servidor' }, { status: 500 });
    }
}