"use client";

import React, { useEffect, useState } from 'react';

const Overview: React.FC = () => {
    const [salesData, setSalesData] = useState<{ totalAmount: number; quantityOfSales: number, currentBalanceDue: number } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const response = await fetch('/api/overview'); // Adjust the API route if necessary
                if (!response.ok) {
                    throw new Error('Failed to fetch sales data');
                }
                const data = await response.json();
                setSalesData({
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex justify-around items-center w-[85vw] h-[7rem] bg-gray-200 rounded-md shadow-md shadow-gray-400">
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
    );
};

export default Overview;