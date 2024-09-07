import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'; // Adjust the import path as necessary
import { prisma } from '@/app/lib/prisma'; // Adjust the import path to your Prisma client

interface SaleData {
    month: Date;
    total_sales: number;
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        // Fetch the user's negocioid based on their email from the session
        const usuario = await prisma.usuarios.findUnique({
            where: { email: session.user?.email as string },
            select: { negocioid: true },
        });

        if (!usuario?.negocioid) {
            return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
        }

        const negocioId = usuario.negocioid;

        // Get the last 3 months of sales data
        const result = await prisma.$queryRaw`
            SELECT
                DATE_TRUNC('month', "created_at") AS month,
                SUM("payment") AS total_sales
            FROM
                ventas
            WHERE
                "negocioid" = CAST(${negocioId} AS UUID)
                AND "created_at" >= CURRENT_DATE - INTERVAL '3 MONTH'
            GROUP BY
                month
            ORDER BY
                month ASC;
        ` as SaleData[];

        // Format result to fit chart.js data format
        const formattedResult = result.map((item) => ({
            month: item.month.toISOString().slice(0, 7),
            total_sales: item.total_sales,
        }));

        // Adjust result based on the number of available months
        const now = new Date();
        const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        const lastThreeMonths = [
            currentMonth,
            new Date(now.setMonth(now.getMonth() - 1)).toISOString().slice(0, 7),
            new Date(now.setMonth(now.getMonth() - 1)).toISOString().slice(0, 7)
        ].reverse();

        // Fill in missing months with 0 sales if necessary
        const monthlyData = lastThreeMonths.map(month => {
            const existing = formattedResult.find(item => item.month === month);
            return existing ? existing : { month, total_sales: 0 };
        });

        return NextResponse.json(monthlyData);
    } catch (error) {
        console.error("Error fetching sales over time:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}