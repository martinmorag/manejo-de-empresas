import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';
import { format } from 'date-fns'; 
import { es } from 'date-fns/locale';

// Updated schema with new fields for credit sales and debt amount
const VentaSchema = z.object({
  payment: z.number().positive("El total debe ser mayor a 0"),
  payment_method: z.string().max(100).optional(),
  clienteid: z.string().uuid("ID del cliente debe ser un UUID"),
  is_on_credit: z.boolean().optional(),
  deuda_amount: z.number().min(0, "El monto de deuda debe ser mayor o igual a 0").optional(),
  due_date: z.string().nullable(),  
  total: z.number().positive(),
  detalles_ventas: z.array(
    z.object({
      productoid: z.string().uuid("ID del producto debe ser un UUID"),
      productname: z.string(),
      quantity: z.number().int().positive("La cantidad debe ser mayor a 0"),
      price: z.number().positive("El precio debe ser mayor a 0"),
      iva_percentage: z.number().min(0).max(100).optional(),
      discount: z.number().min(0).max(100).optional(),
    })
  ).nonempty("Debe incluir al menos un detalle de venta")
});


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




export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const requestBody = await req.json();
    try {

      const parsedBody = VentaSchema.parse(requestBody);

      // Fetch negocioId based on the logged-in user's email
      const usuario = await prisma.usuarios.findUnique({
        where: { id: session.user?.id as string },
        select: { negocioid: true },
      });

      if (!usuario?.negocioid) {
        return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
      }

      // Handle deuda_amount, default to 0 if undefined
      const deuda_amount = parsedBody.is_on_credit ? (parsedBody.deuda_amount ?? 0) : 0;

      const status = parsedBody.is_on_credit ? 'Pagado Parcialmente' : 'Pagado';

      // Create the venta record
      const newVenta = await prisma.ventas.create({
        data: {
          negocioid: usuario.negocioid,
          payment: parsedBody.payment,
          balance_due: deuda_amount,
          status,
          payment_method: parsedBody.payment_method || 'Desconocido', // Default payment method if not provided
          total: parsedBody.total,
          clienteid: parsedBody.clienteid,
        }
      });

      // Create detalles_ventas records
      await prisma.detalles_ventas.createMany({
        data: parsedBody.detalles_ventas.map(detail => ({
          ventaid: newVenta.id,
          productoid: detail.productoid,
          productname: detail.productname,
          quantity: detail.quantity,
          price: detail.price,
          iva_percentage: detail.iva_percentage || 0, // Default value if not provided
          discount: detail.discount || 0, // Default value if not provided
        })),
      });

      // Create a deuda record if the sale is on credit
      if (parsedBody.is_on_credit && deuda_amount > 0) {
        await prisma.deudas.create({
          data: {
            cliente_id: parsedBody.clienteid,
            venta_id: newVenta.id,
            amount: deuda_amount,
            due_date: parsedBody.due_date ? new Date(parsedBody.due_date) : null,  // Include due_date, convert to Date
            status: 'Activo',
          },
        });
      }

      // Fetch the created venta with detalles_ventas
      const createdVenta = await prisma.ventas.findUnique({
        where: { id: newVenta.id },
        include: { detalles_ventas: true }
      });

      return NextResponse.json(createdVenta);
      } catch (error) {
        // Handle Zod validation errors
        if (error instanceof z.ZodError) {
            return NextResponse.json({ errors: error.errors }, { status: 400 });
        }
        throw error; // Rethrow other errors
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ message: 'Error en el servidor' }, { status: 500 });
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
            where: { id: session.user?.id as string },
            select: { negocioid: true },
        });

        if (!usuario?.negocioid) {
            return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
        }

        const negocioId = usuario.negocioid;

        const { searchParams } = new URL(req.url);
        const yearParam = searchParams.get('year');
        const monthParam = searchParams.get('month');

        if (!yearParam && !monthParam) {
          // Fetch distinct months and years where ventas exist for the given negocioId
          const monthsWithVentas = await prisma.ventas.groupBy({
              by: ['created_at'],
              where: { negocioid: negocioId },
              _min: { created_at: true },
          });

          // Format the result to return unique months and years
          const uniqueMonths = monthsWithVentas.map((venta) => {
              if (venta._min.created_at) {
                  const formattedMonthYear = format(venta._min.created_at, "MMMM yyyy", { locale: es }); // Using Spanish months
                  return {
                      formatted: formattedMonthYear, // e.g., "Mayo 2024"
                      year: format(venta._min.created_at, 'yyyy'),
                      month: format(venta._min.created_at, 'MM'),
                  };
              }
              return {
                  formatted: 'Unknown',
                  year: 'Unknown',
                  month: 'Unknown',
              };
          });

          // Remove duplicates by creating a Set from the formatted month strings
          const uniqueResults = Array.from(new Set(uniqueMonths.map(item => item.formatted)))
              .map(formatted => uniqueMonths.find(item => item.formatted === formatted));

          return NextResponse.json(uniqueResults);
        }

        const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
        const month = monthParam ? parseInt(monthParam) : new Date().getMonth() + 1;

        // Fetch all ventas for the given negocioId
        const ventas = await prisma.ventas.findMany({
            where: { negocioid: negocioId,
              created_at: {
                gte: new Date(year, month - 1, 1), // First day of the month
                lt: new Date(year, month, 1),      // First day of the next month
            },
             },
            include: {
              detalles_ventas: {
                  select: {
                    quantity: true,
                    price: true,
                    iva_percentage: true,
                    discount: true,
                    sale_date: true,
                    productname: true, // Include productName
                  },
              },
          },
        });

        return NextResponse.json(ventas);
    } catch (error) {
        console.error("Error fetching ventas:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}


export async function PUT(req: NextRequest) {
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
        where: { id: parsedBody.id },
        data: {
          payment: parsedBody.payment,
          payment_method: parsedBody.payment_method,
          clienteid: parsedBody.clienteid,
          balance_due: parsedBody.is_on_credit ? (parseFloat(parsedBody.deuda_amount?.toString() || '0')) : 0,
          status: parsedBody.is_on_credit ? 'Pagado Parcialmente' : 'Pagado',
        }
      });

      // Update detalles_ventas records
      if (parsedBody.detalles_ventas) {
        await Promise.all(
          parsedBody.detalles_ventas.map(async detail => {
            if (detail.id) {
              // Update existing detalle_venta
              await prisma.detalles_ventas.update({
                where: { id: detail.id },
                data: {
                  productoid: detail.productoid,
                  productname: detail.productname,
                  quantity: detail.quantity,
                  price: detail.price,
                  iva_percentage: detail.iva_percentage || 0,
                  discount: detail.discount || 0,
                },
              });
            } else {
              // Create new detalle_venta if no ID is provided
              await prisma.detalles_ventas.create({
                data: {
                  ventaid: updatedVenta.id,
                  productoid: detail.productoid,
                  productname: detail.productname,
                  quantity: detail.quantity,
                  price: detail.price,
                  iva_percentage: detail.iva_percentage || 0,
                  discount: detail.discount || 0,
                },
              });
            }
          })
        );
      }

      if (parsedBody.is_on_credit && parseFloat(parsedBody.deuda_amount?.toString() || '0') > 0) {
        const existingDeuda = await prisma.deudas.findFirst({
          where: {
              cliente_id: parsedBody.clienteid,
              venta_id: updatedVenta.id || '', // Ensure venta_id is a valid string
          },
      });
      
        await prisma.deudas.upsert({
          where: { id: existingDeuda?.id }, // Use existingDeuda?.id if found
          update: {
            amount: parseFloat(parsedBody.deuda_amount?.toString() || '0'),
            due_date: parsedBody.due_date ? new Date(parsedBody.due_date) : null,
          },
          create: {
            cliente_id: parsedBody.clienteid,
            venta_id: updatedVenta.id || '', // Ensure venta_id is a valid string
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
            venta_id: updatedVenta.id || '', // Ensure venta_id is a valid string
          },
        });
      }

      // Fetch the updated venta with detalles_ventas
      const updatedVentaWithDetails = await prisma.ventas.findUnique({
        where: { id: updatedVenta.id },
        include: { detalles_ventas: true },
      });

      return NextResponse.json(updatedVentaWithDetails);
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        return NextResponse.json({ errors: error.errors }, { status: 400 });
      }
      throw error; // Rethrow other errors
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ message: 'Error en el servidor' }, { status: 500 });
  }
}




export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ventaId = searchParams.get('id');

    if (!ventaId) {
      return NextResponse.json({ message: 'ID de venta no proporcionado' }, { status: 400 });
    }

    // Fetch the venta to verify it exists
    const venta = await prisma.ventas.findUnique({
      where: { id: ventaId },
    });

    if (!venta) {
      return NextResponse.json({ message: 'Venta no encontrada' }, { status: 404 });
    }

    // Delete detalles_ventas records related to the venta
    await prisma.detalles_ventas.deleteMany({
      where: { ventaid: ventaId },
    });

    // Delete deudas records related to the venta, if any
    await prisma.deudas.deleteMany({
      where: { venta_id: ventaId },
    });

    // Delete the venta record
    await prisma.ventas.delete({
      where: { id: ventaId },
    });

    return NextResponse.json({ message: 'Venta eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting venta:', error);
    return NextResponse.json({ message: 'Error en el servidor' }, { status: 500 });
  }
}