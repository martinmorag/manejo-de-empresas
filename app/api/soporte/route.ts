import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma'; // Adjust the path to your Prisma instance
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'; // Adjust the path to your NextAuth options
import nodemailer from 'nodemailer';
import { z } from 'zod';

const contactFormSchema = z.object({
    name: z.string().min(1, 'Nombre es requerido').max(100, 'Nombre es muy largo'),
    lastname: z.string().min(1, 'Apellido es requerido').max(100, 'Apellido es muy largo'),
    email: z.string().email('Correo electrónico no válido'),
    phone_number: z.string().min(10, 'El número de telefono tiene que ser de al menos 10 digitos'),
    subject: z.string().min(1, 'Asunto es requerido').max(255, 'Asunto es muy largo'),
    message: z.string().min(1, 'Mensaje es requerido').max(2000, 'Mensaje es demasiado largo'),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

        const usuario = await prisma.usuarios.findUnique({
            where: { id: session.user.id },
            select: { negocioid: true, name: true },
        });
        if (!usuario?.negocioid) return NextResponse.json({ message: 'Usuario sin negocio' }, { status: 404 });

        const parsedBody = await req.json();
        const parsedData = contactFormSchema.parse(parsedBody);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.PASSWORD,
            },
        });

        const mailOptions = {
            from: `${usuario.name} <${process.env.EMAIL_ADDRESS}>`,
            to: 'recipient_email@example.com',
            subject: parsedData.subject,
            text: `
        Name: ${parsedData.name} ${parsedData.lastname}
        Email: ${parsedData.email}
        Phone Number: ${parsedData.phone_number}
        Subject: ${parsedData.subject}
        Message: ${parsedData.message}
        Negocio: ${usuario.name}
      `,
        };

        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: 'Mensaje enviado exitosamente' });
    } catch (error: any) {
        console.error('Error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Un error ocurrió enviando el mail' }, { status: 500 });
    }
}