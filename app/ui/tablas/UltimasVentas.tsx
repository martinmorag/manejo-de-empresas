"use client";

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface MonthlySales {
    month: string;  // Changed to string for easier handling
    total_sales: number;
}

const UltimasVentas: React.FC = () => {
    const [monthlySales, setMonthlySales] = useState<MonthlySales[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/venta/ultimas");
                if (!response.ok) {
                    throw new Error("No se pudo extraer los datos");
                }
                const data = await response.json();
                
                // Log data for debugging
                console.log(data);
                
                // Ensure the data is in the expected format
                if (Array.isArray(data)) {
                    setMonthlySales(data);
                } else {
                    console.error("Unexpected data format:", data);
                }
            } catch (error) {
                console.error("Error fetching sales data:", error);
            }
        };

        fetchData();
    }, []);

    const chartData = {
        labels: monthlySales?.map(item => item.month) || [],
        datasets: [
            {
                label: 'Ventas totales',
                data: monthlySales?.map(item => item.total_sales) || [],  // Directly use total_sales as number
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1,
                fill: true,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem: any) {
                        const label = tooltipItem.dataset.label || '';
                        return `${label}: ${tooltipItem.raw}`;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Mes'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Cantidad'
                },
                beginAtZero: true,
            }
        }
    };

    return (
        <>
            {monthlySales ? (
                <Line data={chartData} options={chartOptions} />
            ) : (
                <p>Cargando datos...</p>
            )}
        </>
    );
};

export default UltimasVentas;