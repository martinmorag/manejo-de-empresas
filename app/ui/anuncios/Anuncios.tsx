"use client";

import React, { useEffect, useState } from "react";
import { Anuncio } from "@/app/lib/definitions";


const Anuncios :  React.FC = () => {
    const [anuncios, setAnuncios] = useState<Anuncio[] | null>(null)

    useEffect(() => {
        const fetchAnuncios = async () => {
            try {
                const response = await fetch('/api/anuncio/disponible', {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                });

                if (!response.ok) {
                    throw new Error("Error obteniendo los anuncios");
                }

                const data: Anuncio[] = await response.json()
                setAnuncios(data)
            } catch (error) {
                throw new Error("Error obteniendo los anuncios");
            }
        }

        fetchAnuncios();
    }, [])
    return (
        <>
            {anuncios && anuncios.length > 0 && anuncios?.map((anuncio: any) => (
                <div key={anuncio.id} className="flex justify-around items-center w-[85vw] h-[5rem] bg-[#EBC284] rounded-md mb-2">
                    <p className="">
                        {anuncio.message}
                    </p>
                </div>
            ))}
        </>
    )
}

export default Anuncios;