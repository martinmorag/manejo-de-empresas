"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Anuncios from "@/app/ui/anuncios/Anuncios";
import { OverviewSkeleton } from "@/app/ui/skeletons";

const Overview: React.FC = () => {
    const [salesData, setSalesData] = useState<{ userName: string, totalAmount: number; quantityOfSales: number, currentBalanceDue: number } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [greeting, setGreeting] = useState<string>("");

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const response = await fetch('/api/overview'); // Adjust the API route if necessary
                if (!response.ok) {
                    throw new Error('Failed to fetch sales data');
                }
                const data = await response.json();
                setSalesData({
                    userName: data.userName,
                    totalAmount: data.totalAmount,
                    quantityOfSales: data.quantityOfSales,
                    currentBalanceDue: data.totalBalanceDue
                });
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSalesData();
    }, []);

    useEffect(() => {
        const currentHour = new Date().getHours();
        if (currentHour < 12) {
            setGreeting("Buenos días");
        } else if (currentHour < 19) {
            setGreeting("Buenas tardes");
        } else {
            setGreeting("Buenas noches");
        }
    }, []);

    if (loading) return <OverviewSkeleton />;

    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <div className='flex justify-between items-end'>
                <p className='text-lg w-[30%]'>{greeting}, {salesData?.userName}</p>
                <div className='flex items-end'>
                    <Image
                        src="/HomePage/shopping-cart.png"
                        alt="Icono de Abierto"
                        width={25}
                        height={25}
                        className='w-[auto] h-[27px]'
                    />
                    <Image
                        src="/HomePage/compras.png"
                        alt="Icono de Compras"
                        width={37}
                        height={37}
                        className='mx-3'
                    />
                    <Image
                        src="/HomePage/crecimiento-de-beneficios.png"
                        alt="Icono de Estadisticas"
                        width={25}
                        height={25}
                        className='w-[auto] h-[26px]'
                    />
                </div>
            </div>
            <hr className='border border-[#A5A5A5] my-2'/>
            <Anuncios/>
            <div
                className="flex justify-around items-center w-[85vw] h-[6rem] bg-gray-200 rounded-md shadow-md shadow-gray-400">
                <div className="text-center text-xl">
                    <h3>Cantidad de ventas</h3>
                    <p>{salesData?.quantityOfSales ?? 0}</p>
                </div>
                <div className="text-center text-xl">
                    <h3>A cobrar</h3>
                    <p className="text-red-500">$ {salesData?.currentBalanceDue ?? 0}</p>
                </div>
                <div className="text-center text-xl">
                    <h3>Cobrado</h3>
                    <p className="text-[#22007C]">$ {salesData?.totalAmount ?? 0}</p>
                </div>
            </div>
        </div>
    );
};

export default Overview;