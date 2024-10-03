"use client";

import React, { useEffect, useState } from "react";
import { Usuario } from "@/app/lib/definitions";

const EditSecurity : React.FC = () => {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null); // State to track success or error
    const [showEdit, setShowEdit] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string } | null>(null); // New state for validation errors

    const handleShowEdit = (e : React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setShowEdit(prevShowEdit => !prevShowEdit);
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response =  await fetch("/api/perfil/usuario")
                if (!response.ok) {
                    throw new Error("No se encontró usuario")
                }           
                const data = await response.json()
                setUsuario(data);
                setNewEmail(data.email);
            } catch (error: any) {
                console.log(error.message)
            }
        }
        fetchUser()
    }, [])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
    
        setMessage("");
        setValidationErrors(null);

        // Password confirmation check
        if (newPassword && newPassword !== confirmNewPassword) {
          setMessage("La nueva contraseña y la confirmación no coinciden.");
          setIsSuccess(false);
          return;
        }

        const payload: any = {
          new_email: newEmail,
          current_password: currentPassword, // Include current password for verification
        };
    
        // If the user entered a new password, include it in the payload
        if (newPassword) {
            payload.new_password = newPassword;
        }
    
        try {
          const response = await fetch("/api/perfil/seguridad", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
    
          const result = await response.json();
    
          if (!response.ok) {
            if (result.errors) {
              // Handle validation errors from the server
              const formattedErrors = result.errors.reduce(
                (acc: { [key: string]: string }, error: { path: string, message: string }) => {
                  acc[error.path] = error.message;
                  return acc;
                },
                {}
              );
              setValidationErrors(formattedErrors);
            } else {
              setMessage(result.message || "Error al actualizar credenciales");
            }
            setIsSuccess(false);
            return;
          }
    
          setMessage("Credenciales actualizadas con éxito");
          setIsSuccess(true);
        } catch (error: any) {
          setMessage(error.message || "Error al actualizar credenciales");
          setIsSuccess(false);
          setValidationErrors(null);
        }
    };

    return (
        <div className="p-6 bg-white rounded-md">
            <div className="flex items-center mb-5">
            <h2 className="text-2xl font-bold mr-4">Seguridad</h2>
            {showEdit 
                ? 
                <button
                onClick={handleShowEdit} 
                className="w-[100px] h-[40px] border border-solid border-red-400 text-lg rounded-md"
                type="button"
                >Cancelar</button>   
                :
                <button
                onClick={handleShowEdit} 
                className="w-[100px] h-[40px] border border-solid border-main text-lg rounded-md"
                type="button"
                >Editar</button>
            }
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
            <div>
                <label htmlFor="email" className="block font-medium text-lg mb-2">
                Email
                </label>
                {showEdit ?
                    <div className="flex flex-col">
                        <label className="text-gray-500">Nuevo email</label>
                        <input
                        type="email"
                        id="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        required
                        />
                        {validationErrors?.new_email && <p className="text-red-500">{validationErrors.new_email}</p>}
                    </div>
                    :
                    <p className="m-1">{usuario?.email}</p>
                }
                
            </div>
            <div>
                <label htmlFor="password" className="block font-medium text-lg mb-2">
                Contraseña
                </label>
                {showEdit ? (
                <div className="flex flex-col w-full">
                <label className="text-gray-500">Nueva contraseña</label>
                <input
                    name="new_password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border p-2 rounded-md"
                />
                {validationErrors?.new_password && <p className="text-red-500">{validationErrors.new_password}</p>}
                <label className="mt-2 text-gray-500">Confirmar contraseña</label>
                <input
                    name="confirm_new_password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="border p-2 rounded-md"
                />
                {validationErrors?.confirmNewPassword && <p className="text-red-500">{validationErrors.confirmNewPassword}</p>}
                <label className="text-gray-500 mt-9">Confirmar contraseña actual</label>
                <input
                    name="current_password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="border p-2 rounded-md"
                    required // Ensure the current password is required for verification
                />
                {validationErrors?.current_password && <p className="text-red-500">{validationErrors.current_password}</p>}
                </div>
            ) : (
                <p className="m-1">***************</p>
            )}
            </div>
            {showEdit &&
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                 >
                Actualizar Credenciales
              </button>
            }
            {message && (
                <p className={`mt-4 ${isSuccess ? "text-green-500" : "text-red-500"}`}>
                {message}
                </p>
            )}
            </form>
        </div>
    )
}

export default EditSecurity;