"use client";

import React, { useState, useEffect } from "react";
import { Anuncio } from "@/app/lib/definitions";
import CreateAnuncio from "@/app/ui/anuncios/CreateAnuncio";
import AnunciosInfo from "@/app/ui/anuncios/AnunciosInfo";

const AnunciosPage = () => {
    const [anuncios, setAnuncios] = useState<Anuncio[]>([]);

    const fetchAnuncios = async () => {
        try {
            const response = await fetch("/api/anuncio");
            if (response.ok) {
                const data = await response.json();
                setAnuncios(data);
            }
        } catch (error) {
            console.error("Error fetching anuncios:", error);
        }
    };

    useEffect(() => {
        fetchAnuncios();
    }, []);

    const handleNewAnuncio = () => {
        fetchAnuncios(); // Refresh the list of anuncios
    };

    const handleFinalizarAnuncio = async (id: string) => {
        try {
            const currentDate = new Date();

            const response = await fetch(`/api/anuncio?id=${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    finished_at: currentDate.toISOString(),
                    estado: "Finalizado",
                }),
            });

            if (response.ok) {
                fetchAnuncios(); // Refresh anuncios after finalizing
            } else {
                console.error("Error finalizando el anuncio");
            }
        } catch (error) {
            console.error("Error finalizando anuncio:", error);
        }
    };

    return (
        <div className="flex flex-col justify-between items-center">
            <div className="flex justify-center items-center w-[85vw]">
                <h1 className="my-4 text-3xl text-main mx-auto">Anuncios</h1>
            </div>
            <div className="flex w-[85vw]">
                <div className="w-[50%]">
                    <CreateAnuncio onNewAnuncio={handleNewAnuncio}/>
                </div>
                <div className="flex justify-center items-center w-[50%]">
                    <AnunciosInfo anuncios={anuncios} onFinalizarAnuncio={handleFinalizarAnuncio}/>
                </div>
            </div>
        </div>
)
}

export default AnunciosPage;