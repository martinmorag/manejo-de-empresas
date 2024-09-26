"use client";

import React, { useEffect, useState } from 'react';
import { ByProduct } from '@/app/lib/definitions';

const ByProducts: React.FC = () => {
    const [products, setProducts] = useState<ByProduct[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMostSoldProducts = async () => {
            try {
                const response = await fetch('/api/venta/por_producto'); // Replace with your actual endpoint path
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const data = await response.json();
                setProducts(data);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchMostSoldProducts();
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
            <h2 className="text-xl">Productos mas vendidos</h2>
            <ul>
                {products.map((product) => (
                    <li key={product.product_id} 
                    style={{
                        backgroundColor: '#e0e0e0', // Light background for each list item
                        borderRadius: '10px', // Rounded corners
                        boxShadow: '5px 5px 10px #bebebe, -5px -5px 10px #ffffff', // Shadow for neumorphism effect
                        margin: '10px 0', // Space between list items
                        padding: '10px', // Padding for spacing inside each list item
                        transition: 'all 0.3s ease', // Smooth transition for hover effect
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '3px 3px 6px #bebebe, -3px -3px 6px #ffffff'; // Lighter shadow on hover
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '5px 5px 10px #bebebe, -5px -5px 10px #ffffff'; // Original shadow
                    }}
                    >
                        <p>{product.product_name}</p>
                        <p>Monto vendido: ${product.total_sales.toFixed(2)}</p>
                        <p>Cantidad vendida: {product.total_quantity}</p> {/* Display quantity sold */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ByProducts;