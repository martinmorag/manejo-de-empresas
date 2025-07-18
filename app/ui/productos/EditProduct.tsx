"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Producto } from "@/app/lib/definitions";

const EditProduct : React.FC = () => {
    const [formData, setFormData] = useState<Producto>({
        id: "",
        name: "",
        description: "",
        barcode: "",
        price: 0, // Initialize price as a number
    });
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string } | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    const productId = pathname?.split("/").pop();

    useEffect(() => {
        if (!productId) {
            setError("No se pudo encontrar el ID del producto.");
            return;
        }
    
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/producto?id=${productId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
    
                if (!response.ok) {
                    throw new Error("Error obteniendo el producto.");
                }
    
                const data = await response.json();
                console.log("Fetched Data:", data);
    
                // Ensure data contains the correct product
                if (Array.isArray(data) && data.length > 0) {
                    const product = data.find(p => p.id === productId);
                    if (product) {
                        setFormData({
                            id: product.id,
                            name: product.name,
                            description: product.description,
                            barcode: product.barcode,
                            price: parseFloat(product.price) || 0,
                        });
                    } else {
                        setError("Producto no encontrado.");
                    }
                } else {
                    setError("No se encontraron datos del producto.");
                }
            } catch (error) {
                setError("Error al cargar el producto.");
            }
        };
    
        fetchProduct();
    }, [productId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "price" ? parseFloat(value) || 0 : value // Handle price as a number
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/producto?id=${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setMessage("Producto actualizado exitosamente!");
                setError(null);
                setValidationErrors(null);
                router.push("/panel/productos"); // Redirect back to the products list
            } else {
                const result = await response.json();
                if (result.errors) {
                    const formattedErrors = result.errors.reduce(
                        (acc: { [key: string]: string }, error: { path: string; message: string }) => {
                            acc[error.path] = error.message;
                            return acc;
                        },
                        {}
                    );
                    setValidationErrors(formattedErrors);
                } else {
                    setError(result.message || "Error al actualizar el producto.");
                }
                setMessage(null);
            }
        } catch (error) {
            console.error("Error actualizando el producto:", error);
            setError("Error actualizando el producto.");
            setMessage(null);
            setValidationErrors(null);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col w-[90%] text-xl">
            <label className="text-gray-700 font-medium pr-3 mb-1 mt-4">Nombre</label>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {validationErrors?.name && <p className="text-red-600">{validationErrors.name}</p>}

            <label className="text-gray-700 font-medium pr-3 mb-1 mt-4">Descripción</label>
            <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {validationErrors?.description && <p className="text-red-600">{validationErrors.description}</p>}

            <label className="text-gray-700 font-medium pr-3 mb-1 mt-4">Código de Barras</label>
            <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {validationErrors?.barcode && <p className="text-red-600">{validationErrors.barcode}</p>}

            <label className="text-gray-700 font-medium pr-3 mb-1 mt-4">Precio</label>
            <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {validationErrors?.price && <p className="text-red-600">{validationErrors.price}</p>}

            <button
                type="submit"
                className="mt-14 mb-5 w-48 h-12 ml-auto bg-white text-blue-600 border-2 border-blue-600 font-semibold rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200 ease-in-out"
            >
                Guardar Cambios
            </button>

            {message && <p className="text-green-600">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}
        </form>
    );
};

export default EditProduct;