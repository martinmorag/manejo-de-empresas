"use client";

import React, { useEffect, useState } from "react";
import { Deuda } from "@/app/lib/definitions";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/app/ui/ConfirmDelete";

const Deudas : React.FC = () => {
    const [deudas, setDeudas] = useState<Deuda[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [selectedDeudaId, setSelectedDeudaId] = useState<string | null>(null);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await fetch("/api/deuda", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Error obteniendo los productos.");
                }

                const data = await response.json();
                setDeudas(data);
            } catch (error) {
                setError("Error al cargar los productos.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, []); // Empty dependency array means this effect runs once on mount

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
            {deudas.length > 0 ? (
                <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-300">
                        <th className="border border-gray-300 px-4 py-2">Nombre de Cliente</th>
                        <th className="border border-gray-300 px-4 py-2">Fecha de Venta</th>
                        <th className="border border-gray-300 px-4 py-2">Monto</th>
                        <th className="border border-gray-300 px-4 py-2">Estado</th>
                        <th className="w-[120px] text-center px-2 py-2 bg-white"></th>
                    </tr>
                </thead>
                <tbody>
                    {deudas.map((deuda) => (
                        <tr key={deuda.id}>
                            <td className="border border-gray-300 px-4">{deuda.client.name}</td>
                            <td className="border border-gray-300 px-4">{new Date(deuda.venta.created_at).toLocaleDateString()}</td>
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