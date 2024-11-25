import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // Adjust the import path to your Prisma client

export async function GET(req: NextRequest) {
    try {
        const anuncios = await prisma.anuncios.findMany({
            where: { "estado": "Activo"}
        });

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
            where: { "estado": "Activo"}
        });

        return NextResponse.json(updatedAnuncios, { status: 200 });
    } catch (error) {
        console.error('Error fetching anuncios.', error);
        return NextResponse.json({ message: "Problems fetching anuncios" }, { status: 500 });
    }
}