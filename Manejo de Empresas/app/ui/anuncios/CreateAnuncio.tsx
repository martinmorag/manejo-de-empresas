"use client";

import React, { useEffect, useState } from "react";

const CreateAnuncio : React.FC<{ onNewAnuncio: () => void }> = ({ onNewAnuncio }) => {
    const [formData, setFormData] = useState({
        message: "",
        created_at: "",
        finished_at: "",
    })
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const currentDateTime = new Date();

        const dataToSend = {
            ...formData,
            created_at: currentDateTime,
        }

        try {
            const response = await fetch("/api/anuncio", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                setMessage("¡Anuncio creado exitosamente!");
                setError(null);
                setValidationErrors(null);
                setFormData({
                    message: "",
                    created_at: "",
                    finished_at: "",
                })
                onNewAnuncio();
            } else {
                const result = await response.json();
                if (result.errors) {
                    const formattedErrors = result.errors.reduce((acc: { [key: string]: string }, error: { path: string, message: string }) => {
                        acc[error.path] = error.message;
                        return acc;
                    }, {});
                    setValidationErrors(formattedErrors);
                } else {
                    setError(result.message || "Error al crear el anuncio.");
                }
                setMessage(null);
            }
        } catch (error) {
            console.error("Error subiendo anuncio ", error);
            setError("Error subiendo formulario");
            setMessage(null);
            setValidationErrors(null);
        }
    }

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 5000)
            return () => clearTimeout(timer);
        }

    }, [message])
    return (
        <form onSubmit={handleSubmit} className="flex flex-col w-full ">
            <label className="mb-2">Mensaje</label>
            <textarea name="message"
                      value={formData.message}
                      onChange={handleChange} rows={8} cols={4}
                      className="rounded-md p-1 mb-5"
                      required
            ></textarea>
            <label className="mb-2">Fecha de finalización (opcional)</label>
            <input name="finished_at"
                   type="datetime-local"
                   value={formData.finished_at}
                   onChange={handleChange}
                   className="rounded-md p-1 mb-5"
            />
            <button
                type="submit"
                className="m-5 p-2 rounded-md text-lg text-secondary bg-main w-[150px] mx-auto active:scale-95 transition-transform duration-200"
            >Subir anuncio</button>
        </form>
    )
}

export default CreateAnuncio;