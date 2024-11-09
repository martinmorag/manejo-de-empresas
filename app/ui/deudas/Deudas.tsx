"use client";

import React, { useEffect, useState } from "react";
import { Deuda } from "@/app/lib/definitions";
import ConfirmationModal from "@/app/ui/ConfirmDelete";

const Deudas : React.FC = () => {
    const [deudas, setDeudas] = useState<Deuda[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [selectedDeudaId, setSelectedDeudaId] = useState<string | null>(null);
    const [months, setMonths] = useState<{ month: string; year: string; formatted: string }[]>([]);
    const [selectedMonthYear, setSelectedMonthYear] = useState<string>('');

    useEffect(() => {
        const fetchMonths = async () => {
            try {
                const response = await fetch("/api/deuda");
                if (!response.ok) throw new Error("Error fetching months.");

                const data = await response.json();
                setMonths(data);

                if (data.length > 0) {
                    const lastMonth = data[data.length - 1].month; // Assuming the last entry is the latest month
                    const lastYear = data[data.length - 1].year;
                    setSelectedMonthYear(`${lastMonth}-${lastYear}`);
                }
            } catch (error) {
                setError("Error fetching months.");
            }
        };
        fetchMonths();
    }, []);

    useEffect(() => {
        if (!selectedMonthYear) return;

        const [month, year] = selectedMonthYear.split("-");
        const fetchDeudas = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/deuda?month=${month}&year=${year}`);
                if (!response.ok) {
                    const errorMessage = await response.text();
                    console.error("Error Response:", errorMessage); // Debug
                    throw new Error("Error fetching deudas.");
                }
    
                const data = await response.json();
                console.log("Received deudas:", data);
                setDeudas(data);
            } catch (error) {
                console.error("Fetch Error:", error); // Debug
                setError("Error fetching deudas.");
            } finally {
                setLoading(false);
            }
        };
    
        fetchDeudas();
    }, [selectedMonthYear]);      

    const handleDelete = async () => {  
        if (!selectedDeudaId) return;

        try {
            const response = await fetch(`/api/deuda?id=${selectedDeudaId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error eliminando el producto.");
            }

            // Remove the deleted product from the state
            setDeudas((prevDeudas) =>
                prevDeudas.filter((deuda) => deuda.id !== selectedDeudaId)
            );
            setIsModalVisible(false);
            setSelectedDeudaId(null);
        } catch (error) {
            setError("Error al eliminar el producto.");
        }
    };

    const openConfirmationModal = (id: string) => {
        setSelectedDeudaId(id);
        setIsModalVisible(true);
    };

    const closeConfirmationModal = () => {
        setIsModalVisible(false);
        setSelectedDeudaId(null);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <>
            <select
                value={selectedMonthYear}
                onChange={(e) => setSelectedMonthYear(e.target.value)}
                className="mb-4 p-1 rounded-md"
            >
                <option value="" disabled>Selecciona un mes</option>
                {months.map(({ month, year, formatted }) => (
                    <option key={`${month}-${year}`} value={`${month}-${year}`}>
                        {formatted}
                    </option>
                ))}
            </select>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <>
            {deudas.length > 0 ? (
                <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-300">
                        <th className="border border-gray-300 px-4 py-2">Nombre de Cliente</th>
                        <th className="border border-gray-300 px-4 py-2">Fecha de Venta</th>
                        <th className="border border-gray-300 px-4 py-2">Monto</th>
                        <th className="border border-gray-300 px-4 py-2">Estado</th>
                        <th className="w-[120px] text-center px-2 py-2 bg-background"></th>
                    </tr>
                </thead>
                <tbody>
                    {deudas.map((deuda) => (
                        <tr key={deuda.id}>
                            <td className="border border-gray-300 px-4">{deuda.cliente ? deuda.cliente.name : ""}</td>
                            <td className="border border-gray-300 px-4">{deuda?.venta?.created_at ? new Date(deuda.venta.created_at).toLocaleDateString() : ""}</td>
                            <td className="border border-gray-300 px-4">$ {deuda.amount}</td>
                            <td className="border border-gray-300 px-4">{deuda.status}</td>
                            <td className="px-2 flex justify-between items-center space-x-2 w-[120px]">
                                <button
                                    onClick={() => openConfirmationModal(deuda.id)}
                                    className="bg-blue-300 py-1 px-2 rounded-md hover:bg-blue-200"
                                > Saldar Deuda
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            ) : (
                <p>No hay deudas disponibles.</p>
            )}
            </>
            )}
            <ConfirmationModal
                message="¿Estás seguro de que deseas eliminar esta deuda?"
                onConfirm={handleDelete}
                onCancel={closeConfirmationModal}
                isVisible={isModalVisible}
            />
        </> 
    )
}

export default Deudas;