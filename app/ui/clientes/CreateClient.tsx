"use client";

import React, { useState } from "react";
import { Spinner } from "react-bootstrap";

const CreateClient: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setValidationErrors(null);

    try {
      const res = await fetch("/api/cliente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();

        // Set validation errors if they exist
        if (errorData.errors) {
          // Format errors from server
          const formattedErrors = errorData.errors.reduce((acc: { [key: string]: string }, error: { path: string, message: string }) => {
            acc[error.path] = error.message;
            return acc;
          }, {});
          setValidationErrors(formattedErrors);
        } else {
          setError(errorData.message || "Error al crear el cliente");
        }
        setMessage(null);
      } else {
        const data = await res.json();
        setMessage("Cliente creado con éxito");
        setFormData({ name: "", email: "", phone: "", address: "" });
      }
    } catch (error: any) {
      console.error("Error subiendo formulario:", error);
      setError("Error al crear el cliente.");
      setMessage(null);
      setValidationErrors(null);
    } finally {
      setLoading(false);
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

        <label className="text-gray-700 font-medium pr-3 mb-1 mt-4">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {validationErrors?.email && <p className="text-red-600">{validationErrors.email}</p>}

        <label className="text-gray-700 font-medium pr-3 mb-1 mt-4">Teléfono</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {validationErrors?.phone && <p className="text-red-600">{validationErrors.phone}</p>}

        <label className="text-gray-700 font-medium pr-3 mb-1 mt-4">Dirección</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {validationErrors?.address && <p className="text-red-600">{validationErrors.address}</p>}

        <button
          type="submit"
          className="mt-14 mb-5 w-48 h-12 ml-auto bg-white text-blue-600 border-2 border-blue-600 font-semibold rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200 ease-in-out"
          disabled={loading}
        >
          {loading ? "Agregando Cliente..." : "Agregar Cliente"}
        </button>

        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
  );
};

export default CreateClient;