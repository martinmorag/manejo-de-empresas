"use client";

import React, { useState, useEffect } from "react";

const CreateProduct : React.FC = () => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        barcode: "",
        price: "",
    });
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const dataToSend = {
            ...formData,
            price: parseFloat(formData.price) // Convert price from string to number
        };

        try {
            const response = await fetch("/api/producto", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                setMessage("Producto creado exitosamente!");
                setError(null); 
                setValidationErrors(null);
                setFormData({
                    name: "",
                    description: "",
                    barcode: "",
                    price: "",
                });
            } else {
                const result = await response.json();
                if (result.errors) {
                    // Format errors from server
                    const formattedErrors = result.errors.reduce((acc: { [key: string]: string }, error: { path: string, message: string }) => {
                        acc[error.path] = error.message;
                        return acc;
                    }, {});
                    setValidationErrors(formattedErrors);
                } else {
                    setError(result.message || "Error al crear el producto.");
                }
                setMessage(null);
            }
        } catch (error) {
            console.error("Error subiendo formulario:", error);
            setError("Error subiendo formulario.");
            setMessage(null);
            setValidationErrors(null);
        }
    };

    /* Message timeout */

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage("")
            }, 5000)
            return () => clearTimeout(timer);
        }         
    }, [message])


    return (
        <form onSubmit={handleSubmit} className="flex flex-col w-[90%] text-lg">
            <label className="text-gray-700 font-medium pr-3 mb-1">Nombre</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
            {validationErrors?.name && <p className="text-red-600">{validationErrors.name}</p>}

            <label className="text-gray-700 font-medium pr-3 mb-1 mt-4">Descripción</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} required className="h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            {validationErrors?.description && <p className="text-red-600">{validationErrors.description}</p>}

            <label className="text-gray-700 font-medium pr-3 mb-1 mt-4">Código de Barras</label>
            <input type="number" name="barcode" value={formData.barcode} onChange={handleChange} className="h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            {validationErrors?.barcode && <p className="text-red-600">{validationErrors.barcode}</p>}

            <label className="text-gray-700 font-medium pr-3 mb-1 mt-4">Precio</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} required className="h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            {validationErrors?.price && <p className="text-red-600">{validationErrors.price}</p>}

            <button type="submit" className="mt-14 mb-5 w-48 h-12 ml-auto bg-white text-blue-600 border-2 border-blue-600 font-semibold rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200 ease-in-out">Agregar Producto</button>

            {message && <p className="text-green-600">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}
        </form>
    )
}

export default CreateProduct;