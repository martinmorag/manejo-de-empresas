import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'; 
import { prisma } from '@/app/lib/prisma'; 
import { startOfMonth, endOfMonth } from 'date-fns'; 
import { Decimal } from '@prisma/client/runtime/library';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        // Fetch the user's negocioid based on their email from the session
        const usuario = await prisma.usuarios.findUnique({
            where: { id: session.user?.id as string },
            select: { negocioid: true },
        });

        if (!usuario?.negocioid) {
            return NextResponse.json({ message: 'Este usuario no tiene un negocio designado' }, { status: 404 });
        }

        const negocioId = usuario.negocioid;

        // Get the current month range
        const currentMonthStart = startOfMonth(new Date());
        const currentMonthEnd = endOfMonth(new Date());

        // 1. Calculate total sales made this month
        const totalSales = await prisma.ventas.aggregate({
            _sum: { payment: true },
            where: {
                negocioid: negocioId,
                created_at: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd,
                },
            },
        });

        // 2. Calculate the total debt
        const totalDebt = await prisma.deudas.aggregate({
            _sum: { amount: true },
            where: {
                cliente: {
                    negocioid: negocioId, // Ensure the debt is related to the same business
                },
                status: { in: ['Activo'] }, 
                updated_at: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd,
                },
            },
        });

        const totalSalesNumber = new Decimal(totalSales._sum.payment ?? 0).toNumber();
        const totalDebtNumber = new Decimal(totalDebt._sum.amount ?? 0).toNumber();
        const actualAmount = totalSalesNumber - totalDebtNumber;

        return NextResponse.json({
            total_sales: totalSales._sum.payment ?? 0,
            total_debt: totalDebt._sum.amount ?? 0,
            actual_amount: actualAmount,
        });
    } catch (error) {
        console.error("Error fetching actual amount:", error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}