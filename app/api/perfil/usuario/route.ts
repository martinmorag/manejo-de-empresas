import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }
        
        return NextResponse.json(session.user);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
};