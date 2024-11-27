"use client";

import React, { useState, useEffect } from "react";

const MensajeSoporte : React.FC = () => {
    const [formData, setFormData] = useState({
        name: "",
        lastname: "",
        email: "",
        phone_number: "",
        subject: "",
        message: ""
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage(null);

        try {
            const res = await fetch("/api/soporte", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                if (res.status === 400 && data.error) {
                    const errorMessages: Record<string, string> = {};
                    data.error.forEach((err: { path: string[]; message: string }) => {
                        errorMessages[err.path[0]] = err.message;
                    });
                    setErrors(errorMessages);
                    return;
                }
                throw new Error("Error subiendo mensaje, por favor intente de nuevo.");
            }

            setSuccessMessage("Mensaje enviado correctamente!");
            setFormData({
                name: "",
                lastname: "",
                email: "",
                phone_number: "",
                subject: "",
                message: "",
            });
        } catch (error: any) {
            console.error("Error subiendo formulario: ", error);
            setErrors({ general: "Un error ocurrió, por favor intente de nuevo." });
        }
    };

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 5000)
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col border p-2 m-5 mt-10 w-[50%] mx-auto rounded-sm">
            <div className="flex flex-col justify-between items-center m-5 mb-10 text-main">
                <h3 className="text-2xl m-3 mb-7 font-bold text-center">Contacte a Soporte</h3>
                <p className="w-[50%]">Si le gustaría despejar alguna duda o ayuda para usar las herramientas con mas
                    eficiencia, <strong>contáctenos</strong>.</p>
            </div>

            {errors.general && <p className="text-red-500">{errors.general}</p>}
            {successMessage && <p className="text-green-500">{successMessage}</p>}
            <div className="flex justify-between mt-4">
                <div className="flex flex-col">
                    <label>Nombre</label>
                    <input name="name" className="border p-1" onChange={handleChange} type="text" required />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div className="flex flex-col">
                    <label>Apellido</label>
                    <input name="lastname" className="border p-1" onChange={handleChange} type="text" required />
                    {errors.lastname && <p className="text-red-500 text-sm">{errors.lastname}</p>}
                </div>
            </div>
            <label className="mt-4">Email</label>
            <input name="email" className="border p-1" onChange={handleChange} type="email" required />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            <label className="mt-4">Número de teléfono</label>
            <input name="phone_number" className="border p-1" onChange={handleChange} type="tel" required />
            {errors.phone_number && <p className="text-red-500 text-sm">{errors.phone_number}</p>}
            <label className="mt-4">Asunto</label>
            <input name="subject" className="border p-1" onChange={handleChange} type="text" required />
            {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
            <label className="mt-4">Mensaje</label>
            <textarea name="message" rows={7} className="border p-1" onChange={handleChange} required />
            {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
            <button
                type="submit"
                className="px-4 my-10 py-2 border border-main w-fit rounded-md"
            >Enviar
            </button>
        </form>
    )
}

export default MensajeSoporte;