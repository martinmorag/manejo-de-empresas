"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ClientData } from "@/app/lib/definitions";

const EditClient: React.FC = () => {
    const pathname = usePathname();
    const clientId = pathname.split('/').pop() as string;

    const [formData, setFormData] = useState<ClientData>({
        id: "",
        name: "",
        email: "",
        phone: "",
        address: "",
    });
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string } | null>(null);

    useEffect(() => {
        if (!clientId) return; // Exit early if no clientId

        const fetchClientData = async () => {
            try {
                const response = await fetch(`/api/cliente/${clientId}`);
                if (response.ok) {
                    const client = await response.json();
                    setFormData(client);
                } else {
                    setError("Error al cargar los datos del cliente.");
                }
            } catch (error) {
                console.error("Error fetching client data:", error);
                setError("Error al cargar los datos del cliente.");
            }
        };

        fetchClientData();
    }, [clientId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/cliente/${clientId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setMessage("Cliente actualizado exitosamente!");
                setError(null);
                setValidationErrors(null);
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
                    setError(result.message || "Error al actualizar el cliente.");
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

    return (
        <form onSubmit={handleSubmit} className="flex flex-col w-[90%] text-xl">
            <label className="text-gray-700 font-medium pr-3 mb-1 mt-4">Nombre</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            {validationErrors?.name && <p className="text-red-600">{validationErrors.name}</p>}

            <label className="text-gray-700 font-medium pr-3 mb-1 mt-4">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            {validationErrors?.email && <p className="text-red-600">{validationErrors.email}</p>}

            <label className="text-gray-700 font-medium pr-3 mb-1 mt-4">Teléfono</label>
            <input type="text" name="phone" value={formData.phone || ""} onChange={handleChange} className="h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            {validationErrors?.phone && <p className="text-red-600">{validationErrors.phone}</p>}

            <label className="text-gray-700 font-medium pr-3 mb-1 mt-4">Dirección</label>
            <input type="text" name="address" value={formData.address || ""} onChange={handleChange} className="h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            {validationErrors?.address && <p className="text-red-600">{validationErrors.address}</p>}

            <button type="submit" className="mt-14 mb-5 w-48 h-12 ml-auto bg-white text-blue-600 border-2 border-blue-600 font-semibold rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200 ease-in-out">Actualizar Cliente</button>

            {message && <p className="text-green-600">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}
        </form>
    );
};

export default EditClient;