import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/app/lib/prisma'; 
import { z } from "zod";

const updateUserSchema = z.object({
  usuario_name: z.string().min(1, "El nombre del usuario es requerido"),
  usuario_lastname: z.string().min(1, "El apellido del usuario es requerido"),
  profileImage: z.string().nullable().optional(),  
  defaultPicture: z.string().nullable().optional(),
  negocio_name: z.string().min(1, "El nombre del negocio es requerido"),
  negocio_location: z.string().min(1, "La localización del negocio es requerida"),
  negocio_iva_percentage: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "El porcentaje de IVA debe ser un número válido"),
});

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        // Fetch the full user information from the database using the email from the session
        const usuario = await prisma.usuarios.findUnique({
            where: {
                id: session.user.id,
            },
        });

        if (!usuario) {
            return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
        }

        const profileImageBase64 = usuario.profile_image
        ? `${usuario.profile_image}`
        : null;

        // Return user data with profile_image as base64 string
        return NextResponse.json({
            ...usuario,
            profile_image: profileImageBase64,
        });
    } catch (error) {
        console.error("Error fetching user information:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
};



export async function PUT(req: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
  
      if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
      }
  
      // Parse the incoming request data
      const body = await req.json();
  
      // Validate the data using Zod
      const validation = updateUserSchema.safeParse(body);
  
      if (!validation.success) {
        return NextResponse.json(
          { message: 'Datos inválidos', errors: validation.error.errors },
          { status: 400 }
        );
      }
  
      const { 
        usuario_name, 
        usuario_lastname, 
        profileImage,
        defaultPicture,
        negocio_name, 
        negocio_location, 
        negocio_iva_percentage 
      } = validation.data;
  
      // Fetch the user using email from session
      const usuario = await prisma.usuarios.findUnique({
        where: { id: session.user.id },
      });
  
      if (!usuario) {
        return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
      }

      const imageBuffer = profileImage ? Buffer.from(profileImage) : null;

  
      await prisma.usuarios.update({
        where: { email: session.user.email },
        data: {
          name: usuario_name,
          lastname: usuario_lastname,
          profile_image: imageBuffer,  // Ensure it's null if not provided
          default_picture: defaultPicture || null,
        },
      });
  
      await prisma.negocios.update({
        where: { id: usuario.negocioid as string },
        data: {
          name: negocio_name,
          location: negocio_location,
          iva_percentage: parseFloat(negocio_iva_percentage),
        },
      });
  
      return NextResponse.json({ message: 'Datos actualizados con éxito' });
  
    } catch (error) {
      console.error("Error updating user information:", error);
      return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}