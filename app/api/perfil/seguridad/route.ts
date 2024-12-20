import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';

// Schema to validate the request body
const updateCredentialsSchema = z.object({
  new_email: z.string().email("El email debe ser válido").optional(),
  new_password: z
      .string()
      .optional()
      .refine((value) => {
        if (!value) return true; // Allow skipping validation if `new_password` is not provided
        const validations = {
          hasNumber: /\d/.test(value),
          hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
          hasMinLength: value.length >= 12,
          hasUpperLower: /[a-z]/.test(value) && /[A-Z]/.test(value),
        };
        return (
            validations.hasNumber &&
            validations.hasSpecialChar &&
            validations.hasMinLength &&
            validations.hasUpperLower
        );
      }, "La contraseña debe tener al menos 12 caracteres, incluir números, caracteres especiales y letras mayúsculas/minúsculas."),
  old_password: z.string().min(8, "La contraseña actual es necesaria para la confirmación").optional(),
});



export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session Data:", session);

    // Check if the user is authenticated
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Parse the incoming request data
    const body = await req.json();

    // Validate the data using Zod
    const validation = updateCredentialsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { new_email, new_password, old_password } = validation.data;

    // Fetch the user using email from session
    const usuario = await prisma.usuarios.findUnique({
      where: { id: session.user.id },
    });

    if (!usuario) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verify the current password
    if (old_password && !(await bcrypt.compare(old_password, usuario.password))) {
      return NextResponse.json({ message: 'La contraseña actual no es correcta' }, { status: 400 });
    }

    // Prepare data to update
    const updateData: { email?: string; password?: string } = {};

    // Update email if provided and different from current
    if (new_email && new_email !== usuario.email) {
      const emailExists = await prisma.usuarios.findUnique({
        where: { email: new_email },
      });
      if (emailExists) {
        return NextResponse.json({ message: 'El email ya está en uso' }, { status: 400 });
      }
      updateData.email = new_email;
    }

    // Update password if provided
    if (new_password) {
      // Hash the new password before saving it
      const hashedPassword = await bcrypt.hash(new_password, 10);
      updateData.password = hashedPassword;
    }

    // Update the user in the database with email and/or password
    await prisma.usuarios.update({
      where: { id: usuario.id }, // Use the user ID instead of email
      data: updateData,
    });

    return NextResponse.json({ message: 'Credenciales actualizadas con éxito' });

    // if (Object.keys(updateData).length > 0) {
    //     await prisma.usuarios.update({
    //       where: { id: session.user.id },
    //       data: updateData,
    //     });
    // }
  } catch (error) {
    console.error("Error updating user credentials:", error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}