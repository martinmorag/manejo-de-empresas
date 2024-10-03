import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'; // Adjust the import path as necessary
import { prisma } from '@/app/lib/prisma'; // Adjust the import path to your Prisma client
import { z } from 'zod';

const clientSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Email no válido"),
    phone: z.string().optional(),
    address: z.string().optional(),
  });

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        // Fetch the user's negocioid based on their email from the session
        const usuario = await prisma.usuarios.findUnique({
            where: { id: session.user?.id as string },
            include: { negocio: true },
        });

        if (!usuario?.negocioid) {
            return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
        }

        // Fetch all clients linked to the user's negocioid
        const clients = await prisma.clientes.findMany({
            where: { negocioid: usuario.negocioid },
        });

        return NextResponse.json(clients);
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
  
      if (!session) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
      }
  
      // Parse the request body to get client details
      const jsonData = await req.json();
  
      // Validate the request data using the Zod schema
      const validationResult = clientSchema.safeParse(jsonData);
  
      if (!validationResult.success) {
        // Extract and format validation errors
        const errors = validationResult.error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        return NextResponse.json({ message: 'Datos de cliente no válidos', errors }, { status: 400 });
      }
  
      const { name, email, phone, address } = validationResult.data;
  
      // Fetch the user's negocioid based on their email from the session
      const usuario = await prisma.usuarios.findUnique({
        where: { id: session.user?.id as string },
        include: { negocio: true },
      });
  
      if (!usuario?.negocioid) {
        return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
      }
  
      // Check if the client with the given email already exists in the same negocio
      const existingClient = await prisma.clientes.findUnique({
        where: { email },
      });
  
      if (existingClient) {
        return NextResponse.json({ message: 'Cliente con este email ya existe' }, { status: 409 });
      }
  
      // Create the new client
      const newClient = await prisma.clientes.create({
        data: {
          name,
          email,
          phone,
          address,
          negocioid: usuario.negocioid,
        },
      });
  
      return NextResponse.json(newClient, { status: 201 });
    } catch (error) {
      console.error("Error creating client:", error);
      return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}


export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Extract clientId from the request URL
    const url = new URL(req.url);
    const clientId = url.searchParams.get('id');

    if (!clientId || !isValidUUID(clientId)) {
      return NextResponse.json({ message: 'ID de cliente no válido' }, { status: 400 });
    }

    // Fetch the user's negocioid based on their email from the session
    const usuario = await prisma.usuarios.findUnique({
      where: { id: session.user?.id as string },
      include: { negocio: true },
    });

    if (!usuario?.negocioid) {
      return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
    }

    // Check if the client exists
    const existingClient = await prisma.clientes.findUnique({
      where: { id: clientId },
    });

    if (!existingClient) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 });
    }

    // Check if the client belongs to the user's negocio
    if (existingClient.negocioid !== usuario.negocioid) {
      return NextResponse.json({ message: 'Cliente no pertenece a tu negocio' }, { status: 403 });
    }

    // Delete the client
    await prisma.clientes.delete({
      where: { id: clientId },
    });

    return NextResponse.json({ message: 'Cliente eliminado exitosamente' }, { status: 200 });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

function isValidUUID(uuid: string): boolean {
  const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return regex.test(uuid);
}