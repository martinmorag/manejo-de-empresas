"use client"

import React, { useState, useEffect } from "react";
import { PlusIcon, MinusIcon, ArchiveBoxIcon, BanknotesIcon, UserIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { AccesosDirectos } from "@/app/lib/definitions";

const accesosDirectosList = [
    {name: "lista_productos", title: "Lista de productos", href: "/panel/productos", icon: ArchiveBoxIcon},
    {name: "agregar_productos", title: "Agregar producto", href: "/panel/productos/crear", icon: ArchiveBoxIcon},
    {name: "lista_ventas", title: "Lista de ventas", href: "/panel/ventas", icon: BanknotesIcon},
    {name: "agregar_venta", title: "Agregar venta", href: "/panel/ventas/crear", icon: BanknotesIcon},
    {name: "lista_clientes", title: "Lista de clientes", href: "/panel/clientes", icon: UserIcon},
    {name: "agregar_cliente", title: "Agregar cliente", href: "/panel/clientes/crear", icon: UserIcon},
    {name: "lista_deudas", title: "Lista de deudas",href: "/panel/deudas", icon: ExclamationTriangleIcon}
]

const AccesoDirecto : React.FC = () => {
    const [isShown, setIsShown] = useState(false);
    const [accesosDirectos, setAccesosDirectos] = useState<AccesosDirectos>({
        lista_productos: false,
        agregar_productos: false,
        lista_ventas: false,
        agregar_venta: false,
        lista_clientes: false,
        agregar_cliente: false,
        lista_deudas: false
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = () => {
        setIsShown(prevIsShow => !prevIsShow)
    }

    useEffect(() => {
        const fetchAccesosDirectos = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/overview/accesos");
                if (!response.ok) {
                    throw new Error('Failed to fetch accesos directos');
                }
                const data: AccesosDirectos | null = await response.json();

                // If data is null, use default values
                if (data && typeof data === 'object') {
                    setAccesosDirectos({
                        lista_productos: data.lista_productos ?? false,
                        lista_ventas: data.lista_ventas ?? false,
                        lista_clientes: data.lista_clientes ?? false,
                        lista_deudas: data.lista_deudas ?? false,
                        agregar_productos: data.agregar_productos ?? false,
                        agregar_venta: data.agregar_venta ?? false,
                        agregar_cliente: data.agregar_cliente ?? false,
                    });
                } else {
                    // Optionally log that data was null or handle as needed
                    console.log("No accesos found, using default values.");
                }
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAccesosDirectos();
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setAccesosDirectos((prevAccesos: AccesosDirectos) => ({
            ...prevAccesos,
            [name]: checked,
        }));
    };
    console.log({acceso_directos: accesosDirectos})
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
    
        try {
            const response = await fetch("/api/overview/accesos", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    accesos_directos: accesosDirectos
                }),
                
            });
            
            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.message || "Failed to save accesos directos");
            }
            
            console.log("Accesos directos saved successfully:", accesosDirectos);
        } catch (error: any) {
            console.error("Error saving accesos directos:", error.message);
        }
    }; 

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
        <div className="flex justify-between items-end">
            <h3>Accesos Directos</h3>
            <button onClick={handleAdd}>
                {isShown 
                ? 
                <MinusIcon className="w-[25px] h-[25px] text-black border border-black p-1 rounded-md"/>
                :
                <PlusIcon className="w-[25px] h-[25px] text-black border border-black p-1 rounded-md"/>
                }
                
            </button>
        </div>
        <hr className='border border-[#A5A5A5] my-2'/>
        <div className={`overflow-hidden transition-all duration-300 ${isShown ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <form className="grid grid-cols-4 gap-2 items-center" onSubmit={handleSubmit}>
                <div className="flex items-center">
                    <input type="checkbox" name="lista_productos" checked={accesosDirectos.lista_productos ?? false} onChange={handleChange} className="w-4 h-4 m-2" />
                    <label>Lista de productos</label>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" name="lista_ventas" checked={accesosDirectos.lista_ventas || false} onChange={handleChange} className="w-4 h-4 m-2" />
                    <label>Lista de ventas</label>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" name="lista_clientes" checked={accesosDirectos.lista_clientes || false} onChange={handleChange} className="w-4 h-4 m-2" />
                    <label>Lista de clientes</label>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" name="lista_deudas" checked={accesosDirectos.lista_deudas || false} onChange={handleChange} className="w-4 h-4 m-2" />
                    <label>Lista de deudas</label>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" name="agregar_productos" checked={accesosDirectos.agregar_productos || false} onChange={handleChange} className="w-4 h-4 m-2" />
                    <label>Agregar producto</label>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" name="agregar_venta" checked={accesosDirectos.agregar_venta || false} onChange={handleChange} className="w-4 h-4 m-2" />
                    <label>Agregar venta</label>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" name="agregar_cliente" checked={accesosDirectos.agregar_cliente || false} onChange={handleChange} className="w-4 h-4 m-2" />
                    <label>Agregar cliente</label>
                </div>
                <div></div>
                <button type="submit" onClick={() => setIsShown(!isShown)} className="relative right-0 border p-2 mt-5 mb-5 rounded-md w-[60%] border-[#A5A5A5]">Guardar cambios</button>
            </form>
        </div>

        {accesosDirectos && Object.keys(accesosDirectos).length > 0 && (
            <div
                className={`flex flex-wrap transition-all duration-300 ease-in-out overflow-hidden ${
                !isShown ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0'
                }`}
            >
            {accesosDirectosList
                    .filter(item => accesosDirectos[item.name as keyof AccesosDirectos])
                    .map(item => (
                        <a key={item.name} href={item.href} className="flex flex-wrap gap-4 border border-blue-500 p-2 m-2 rounded-md w-fit">
                            <div className="flex items-center space-x-2 text-blue-500">
                                <item.icon className="w-6 h-6" />
                                <span>{item.title}</span>
                            </div>
                        </a>
                    ))}
            </div>
        )}
        </div>
    )
}

export default AccesoDirecto;