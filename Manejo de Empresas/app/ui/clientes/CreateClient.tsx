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
        <label className="mb-2">Nombre</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="h-[2.2rem] pl-2 rounded-md border-2 border-solid border-main"
        />
        {validationErrors?.name && <p className="text-red-600">{validationErrors.name}</p>}

        <label className="mb-2 mt-4">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="h-[2.2rem] pl-2 rounded-md border-2 border-solid border-main"
        />
        {validationErrors?.email && <p className="text-red-600">{validationErrors.email}</p>}

        <label className="mb-2 mt-4">Teléfono</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="h-[2.2rem] pl-2 rounded-md border-2 border-solid border-main"
        />
        {validationErrors?.phone && <p className="text-red-600">{validationErrors.phone}</p>}

        <label className="mb-2 mt-4">Dirección</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="h-[2.2rem] pl-2 rounded-md border-2 border-solid border-main"
        />
        {validationErrors?.address && <p className="text-red-600">{validationErrors.address}</p>}

        <button
          type="submit"
          className="mt-[3.5rem] mb-5 w-[200px] h-[45px] ml-auto bg-white rounded-lg text-xl border-[3px] border-main border-solid"
          disabled={loading}
        >
          {loading ? "Crear Cliente..." : "Crear Cliente"}
        </button>

        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
  );
};

export default CreateClient;