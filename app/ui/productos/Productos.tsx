"use client";

import React, { useEffect, useState } from "react";
import { Producto } from "@/app/lib/definitions";
import {ChevronLeftIcon, ChevronRightIcon, PencilIcon, TrashIcon} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/app/ui/ConfirmDelete";
import { TablesPCSkeleton } from "@/app/ui/skeletons";

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

    /* Pagination */

    const itemsPerPage = 25;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(productos.length / itemsPerPage);

    const getPaginatedData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return productos.slice(startIndex, startIndex + itemsPerPage);
    };

    const displayedItems = getPaginatedData();

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const previousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };
    
    /* Confirmation Modal, Toggle, Delete and Edit */

    const openConfirmationModal = (id: string) => {
        setSelectedProductId(id);
        setIsModalVisible(true);
    };

    const closeConfirmationModal = () => {
        setIsModalVisible(false);
        setSelectedProductId(null);
    };

    if (loading) {
        return <TablesPCSkeleton />;
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
                        <th className="w-[80px] text-center px-2 py-2 bg-background"></th>
                    </tr>
                </thead>
                <tbody>
                        {displayedItems.map((producto) => (
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
            {totalPages > 1 && (
                <div className="flex justify-center my-5">
                    <button onClick={previousPage}>
                        <ChevronLeftIcon className="w-5 h-5"/>
                    </button>
                    <p className="text-lg m-2 p-2 bg-gray-300 rounded-md">{currentPage}</p>
                    <button onClick={nextPage}>
                        <ChevronRightIcon className="w-5 h-5"/>
                    </button>
                </div>
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