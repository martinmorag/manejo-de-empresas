import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'; // Adjust the import path as necessary
import { prisma } from '@/app/lib/prisma'; // Adjust the import path to your Prisma client
import { z } from "zod";

const AnuncioSchema = z.object({
    message: z.string().min(1, "Mensaje es requerido"),
    created_at: z.string().transform((str) => new Date(str)),
    finished_at: z.string().nullable().transform((str) => str ? new Date(str) : null),
})

export async function GET(req: NextRequest) {
    try {
        const anuncios = await prisma.anuncios.findMany({
            include: {
                usuarios: {
                    select: {
                        name: true,
                        lastname: true,
                    }
                }
            }
        });

        // Check and update "estado" dynamically
        await Promise.all(
            anuncios.map(async (anuncio) => {
                if (anuncio.finished_at && new Date(anuncio.finished_at) <= new Date() && anuncio.estado !== "Finalizado") {
                    // Update "estado" to "Finalizado" if the finished_at date has passed
                    await prisma.anuncios.update({
                        where: { id: anuncio.id },
                        data: { estado: "Finalizado" },
                    });
                }
            })
        );

        const updatedAnuncios = await prisma.anuncios.findMany({
            include: {
                usuarios: {
                    select: {
                        name: true,
                        lastname: true,
                    }
                }
            }
        });

        return NextResponse.json(updatedAnuncios, { status: 200 });
    } catch (error) {
        console.error('Error fetching anuncios.', error);
        return NextResponse.json({ message: "Problems fetching anuncios" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "No autorizado" }, { status: 401 });
        }

        const usuario = await prisma.usuarios.findUnique({
            where: { id: session.user?.id as string},
            include: { negocio: true },
        })

        if (!usuario?.negocioid) {
            return NextResponse.json({ message: "Este usuario no tiene un negocio" }, { status: 404 });
        }

        const requestBody = await req.json();
        const parsedBody = AnuncioSchema.parse(requestBody);

        const newAnuncio = await prisma.anuncios.create({
            data: {
                message: parsedBody.message,
                usuarioid: session.user?.id as string,
                created_at: parsedBody.created_at,
                finished_at: parsedBody.finished_at ?? null,
                estado: "Activo",
            }
        })

        return NextResponse.json(newAnuncio);
    } catch (error) {
        console.error("Error creating anuncio. ",  error );
        return NextResponse.json({ message: "Error creating anuncio." }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get('id');

        const { finished_at, estado } = await req.json(); // Extract the body fields

        if (!id) {
            return NextResponse.json({ message: "ID is required" }, { status: 400 });
        }

        // Update the anuncio record in the database
        const updatedAnuncio = await prisma.anuncios.update({
            where: { id: id },
            data: {
                finished_at: finished_at ? new Date(finished_at) : null, // Set finished_at (can be null)
                estado: estado || "Activo", // Update estado
            },
        });

        return NextResponse.json(updatedAnuncio, { status: 200 });
    } catch (error) {
        console.error("Error finalizando anuncio ", error);
        return NextResponse.json({ message: "Hubo un error al finalizar el anuncio" }, { status: 500 })
    }
}