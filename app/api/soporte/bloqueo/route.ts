import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.PASSWORD,
            },
        });

        const mailOptions = {
            from: `<${process.env.EMAIL_ADDRESS}>`,
            to: `<${process.env.EMAIL_ADDRESS}>`,
            subject: `Bloqueo en Crece de email: ${email}`,
            text: `
        Esta cuenta ha sido bloqueada por 10 intentos fallidos de ingreso.
        
        Email: ${email} 
      `,
        };

        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: 'Mensaje enviado exitosamente' });
    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Un error ocurrió enviando el mail' }, { status: 500 });
    }
}