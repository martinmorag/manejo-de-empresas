import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'; 
import { prisma } from '@/app/lib/prisma';
import { z } from "zod";

const clientSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Email no válido"),
    phone: z.string().optional(),
    address: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

        // Extract the client ID from the params
        const { id: clientId } = params;

        if (!clientId) {
            return NextResponse.json({ message: 'ID del cliente no proporcionado' }, { status: 400 });
        }

        // Fetch the specific client linked to the user's negocioid and the provided client ID
        const client = await prisma.clientes.findFirst({
            where: { 
                id: clientId,
                negocioid: usuario.negocioid 
            },
        });

        if (!client) {
            return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 });
        }

        return NextResponse.json(client);
    } catch (error) {
        console.error("Error fetching client:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}



export async function PUT(req: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
  
      if (!session) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
      }
  
      // Extract clientId from the request URL
      const url = new URL(req.url);
      const clientId = url.pathname.split('/').pop() as string;
  
      if (!clientId) {
        return NextResponse.json({ message: 'ID de cliente no proporcionado' }, { status: 400 });
      }
  
      // Parse the request body to get client details
      const { name, email, phone, address } = await req.json();
  
      // Validate the request data using the Zod schema
      const validationResult = clientSchema.safeParse({ name, email, phone, address });
  
      if (!validationResult.success) {
        // Extract and format validation errors
        const errors = validationResult.error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        return NextResponse.json({ message: 'Datos de cliente no válidos', errors }, { status: 400 });
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
  
      // Update the client
      const updatedClient = await prisma.clientes.update({
        where: { id: clientId },
        data: {
          name,
          email,
          phone,
          address,
          negocioid: usuario.negocioid,
        },
      });
  
      return NextResponse.json(updatedClient);
    } catch (error) {
      console.error("Error updating client:", error);
      return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}