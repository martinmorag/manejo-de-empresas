"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import ConfirmationModal from "@/app/ui/ConfirmDelete"; // Adjust import path as necessary
import { Venta } from "@/app/lib/definitions";

const Ventas: React.FC = () => {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [selectedVentaId, setSelectedVentaId] = useState<string | null>(null);
    const [expandedVentaId, setExpandedVentaId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const response = await fetch("/api/venta", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Error obteniendo las ventas.");
                }

                const data = await response.json();
                setVentas(data);
            } catch (error) {
                setError("Error al cargar las ventas.");
            } finally {
                setLoading(false);
            }
        };

        fetchVentas();
    }, []); // Empty dependency array means this effect runs once on mount

    const toggleDetails = (ventaId: string) => {
        setExpandedVentaId(expandedVentaId === ventaId ? null : ventaId);
    };

    const handleEdit = (id: string) => {
        router.push(`/panel/ventas/editar/${id}`);
    };

    const handleDelete = async () => {
        if (!selectedVentaId) return;

        try {
            const response = await fetch(`/api/venta?id=${selectedVentaId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error eliminando la venta.");
            }

            setVentas((prevVentas) =>
                prevVentas.filter((venta) => venta.id !== selectedVentaId)
            );
            setIsModalVisible(false);
            setSelectedVentaId(null);
        } catch (error) {
            setError("Error al eliminar la venta.");
        }
    };

    const openConfirmationModal = (id: string) => {
        setSelectedVentaId(id);
        setIsModalVisible(true);
    };

    const closeConfirmationModal = () => {
        setIsModalVisible(false);
        setSelectedVentaId(null);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <>
            {ventas.length > 0 ? (
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-300">
                            <th className="border border-gray-300 px-4 py-2">Fecha</th>
                            <th className="border border-gray-300 px-4 py-2">Producto</th>
                            <th className="border border-gray-300 px-4 py-2">Pago</th>
                            <th className="border border-gray-300 px-4 py-2">Saldo Pendiente</th>
                            <th className="border border-gray-300 px-4 py-2">Método de Pago</th>
                            <th className="w-[80px] text-center px-2 py-2 bg-white"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {ventas.map((venta) => (
                            <React.Fragment key={venta.id}>
                                <tr onClick={() => toggleDetails(venta.id)} className="cursor-pointer">
                                    <td className="border border-gray-300 px-4">
                                        {new Date(venta.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="border border-gray-300 px-4">
                                        {venta.detalles_ventas.map((detalle) => (
                                            <p key={detalle.id}> {/* Assuming detalle has a unique ID */}
                                                {detalle.producto?.name} {/* Display product name */}
                                            </p>
                                        ))}
                                    </td>
                                    <td className="border border-gray-300 px-4">
                                        ${parseFloat(venta.payment.toString()).toFixed(2)}
                                    </td>
                                    <td className="border border-gray-300 px-4">
                                        ${venta.balance_due ? parseFloat(venta.balance_due.toString()).toFixed(2) : 'N/A'}
                                    </td>
                                    <td className="border border-gray-300 px-4">
                                        {venta.payment_method || 'N/A'}
                                    </td>
                                    <td className="px-2 flex justify-between items-center space-x-2 w-[80px]">
                                        <button onClick={() => handleEdit(venta.id)}>
                                            <PencilIcon className="w-7 h-7 bg-blue-500 text-white p-1 rounded hover:bg-blue-700" />
                                        </button>
                                        <button onClick={() => openConfirmationModal(venta.id)}>
                                            <TrashIcon className="w-7 h-7 bg-red-500 text-white p-1 rounded hover:bg-red-700" />
                                        </button>
                                    </td>
                                </tr>
                                {expandedVentaId === venta.id && (
                                    <tr>
                                        <td colSpan={4} className="border border-gray-300 px-4 py-2">
                                            <ul className="list-disc pl-5">
                                                {venta.detalles_ventas.map((detalle, index) => (
                                                    <li key={index} className="mb-2">
                                                        <p><strong>Cantidad:</strong> {detalle.quantity}</p>
                                                        <p><strong>Precio:</strong> $ {parseFloat(detalle.price.toString()).toFixed(2)}</p>
                                                        <p><strong>IVA:</strong> % {detalle.iva_percentage ?? 'N/A'}</p>
                                                        <p><strong>Descuento:</strong> % {detalle.discount ?? 'N/A'}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No hay ventas disponibles.</p>
            )}
            <ConfirmationModal
                message="¿Estás seguro de que deseas eliminar esta venta?"
                onConfirm={handleDelete}
                onCancel={closeConfirmationModal}
                isVisible={isModalVisible}
            />
        </>
    );
};

export default Ventas;