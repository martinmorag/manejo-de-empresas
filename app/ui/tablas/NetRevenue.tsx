"use client";

import { useState, useEffect } from 'react';
import { NetRevenueData } from '@/app/lib/definitions';

const NetRevenue = () => {
    const [netRevenue, setNetRevenue] = useState<NetRevenueData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNetRevenue = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/venta/net_revenue'); // Adjust the API endpoint URL as necessary
                if (!response.ok) {
                    throw new Error(`Error fetching data: ${response.statusText}`);
                }
                const data: NetRevenueData = await response.json();
                setNetRevenue(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNetRevenue();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div 
        style={{
            backgroundColor: '#e0e0e0', // Light background
            borderRadius: '10px', // Rounded corners
            boxShadow: 'inset 8px 8px 16px #bebebe, inset -8px -8px 16px #ffffff', // Neumorphic shadow for a sunken effect
            padding: '20px', // Padding for spacing inside the div
            textAlign: 'center', // Center align text
            margin: '20px 0', // Margin for spacing outside the div
            width: 'fit-content', // Adjust width as needed
            display: 'flex', // Use flexbox
            flexDirection: 'column', // Arrange items in a column
            alignItems: 'center', // Center items horizontally
            justifyContent: 'center', // Center items vertically
        }}>
            <h2 className='text-xl mb-2'>Dinero Ganado</h2>
            {netRevenue && (
                <div>
                    <p>Monto: $ {(netRevenue.actual_amount ?? 0).toFixed(2)}</p>
                </div>
            )}

        </div>
    );
};

export default NetRevenue;