"use client";

import React, { useEffect, useState } from "react";
import { Producto } from "@/app/lib/definitions";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/app/ui/ConfirmDelete";

const Productos : React.FC = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await fetch("/api/producto", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Error obteniendo los productos.");
                }

                const data = await response.json();
                setProductos(data);
            } catch (error) {
                setError("Error al cargar los productos.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, []); // Empty dependency array means this effect runs once on mount

    const handleEdit = (id: string) => {
        // Redirect to edit page with the product id
        router.push(`/panel/productos/editar/${id}`);
    };

    const handleDelete = async () => {  
        if (!selectedProductId) return;

        try {
            const response = await fetch(`/api/producto?id=${selectedProductId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error eliminando el producto.");
            }

            // Remove the deleted product from the state
            setProductos((prevProductos) =>
                prevProductos.filter((producto) => producto.id !== selectedProductId)
            );
            setIsModalVisible(false);
            setSelectedProductId(null);
        } catch (error) {
            setError("Error al eliminar el producto.");
        }
    };

    const openConfirmationModal = (id: string) => {
        setSelectedProductId(id);
        setIsModalVisible(true);
    };

    const closeConfirmationModal = () => {
        setIsModalVisible(false);
        setSelectedProductId(null);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <>
            {productos.length > 0 ? (
                <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-300">
                        <th className="border border-gray-300 px-4 py-2 ">Nombre</th>
                        <th className="border border-gray-300 px-4 py-2">Descripción</th>
                        <th className="border border-gray-300 px-4 py-2">Código de Barras</th>
                        <th className="border border-gray-300 px-4 py-2">Precio</th>
                        <th className="w-[80px] text-center px-2 py-2 bg-white"></th>
                    </tr>
                </thead>
                <tbody>
                        {productos.map((producto) => (
                            <tr key={producto.id}>
                                <td className="border border-gray-300 px-4 ">{producto.name}</td>
                                <td className="border border-gray-300 px-4 ">{producto.description}</td>
                                <td className="border border-gray-300 px-4 ">{producto.barcode}</td>
                                <td className="border border-gray-300 px-4 ">
                                    ${typeof producto.price === "number"
                                        ? producto.price.toFixed(2)
                                        : parseFloat(producto.price).toFixed(2)}
                                </td>
                                <td className="px-2 flex justify-between items-center space-x-2 w-[80px]">
                                    <button
                                        onClick={() => handleEdit(producto.id)}
                                    >
                                        <PencilIcon className="w-7 h-7 bg-blue-500 text-white p-1 rounded hover:bg-blue-700" />
                                    </button>
                                    <button
                                        onClick={() => openConfirmationModal(producto.id)}
                                    >
                                        <TrashIcon className="w-7 h-7 bg-red-500 text-white p-1 rounded hover:bg-red-700" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
                </table>
            ) : (
                <p>No hay productos disponibles.</p>
            )}
            <ConfirmationModal
                message="¿Estás seguro de que deseas eliminar este producto?"
                onConfirm={handleDelete}
                onCancel={closeConfirmationModal}
                isVisible={isModalVisible}
            />
        </> 
    )
}

export default Productos;