"use client";

import React, { useEffect, useState } from "react";
import { AnunciosInfoProps } from "@/app/lib/definitions";

const AnunciosInfo :  React.FC<AnunciosInfoProps> = ({ anuncios, onFinalizarAnuncio }) => {
    return (
        <div className="h-[92%] max-h-[60vh] w-[95%] flex flex-col items-center rounded-sm bg-[#DDD5D0] overflow-y-scroll">
            {anuncios && anuncios.length > 0 ? anuncios?.map((anuncio:any) => (
                <div key={anuncio.id}
                className="p-2 m-2 h-fit max-h-full bg-white w-[97%] rounded-sm">
                    <div className="flex justify-between">
                        <div className="flex flex-col">
                            <p>Publicado por: {anuncio.usuarios.name} {anuncio.usuarios.lastname}</p>
                            <p>Fecha de creación: {new Date(anuncio.created_at).toLocaleString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}</p>
                            <p>Fecha de
                                finalización: {anuncio.finished_at && new Date(anuncio.finished_at).toLocaleString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}</p>
                            <p>Estado: {anuncio.estado}</p>
                        </div>
                        {anuncio.estado === "Activo" && (
                            <div className="flex items-center">
                                <button className="p-1 px-2 rounded-sm bg-[#DDD5D0]"
                                        onClick={() => onFinalizarAnuncio(anuncio.id)}>Finalizar anuncio
                                </button>
                            </div>
                        )}
                    </div>
                    <hr className="border w-[92%] mx-auto my-1.5"/>
                    <div className="text-center mt-3">
                        <p>{anuncio.message}</p>
                    </div>
                </div>
                ))
                : "No se publicaron anuncios anteriormente"}
        </div>
    )
}

export default AnunciosInfo;