import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Usuario } from "@/app/lib/definitions";

const images = [
    { id: "first", name: "Primera", src: "profile" },
    { id: "second", name: "Segunda", src: "profile2" },
    { id: "third", name: "Tercera", src: "profile3" },
    { id: "fourth", name: "Cuarta", src: "profile4" },
    { id: "fifth", name: "Quinta", src: "profile5" },
    { id: "sixth", name: "Sexta", src: "profile6" },
    { id: "seventh", name: "Séptima", src: "profile7" },
    { id: "eighth", name: "Octava", src: "profile8" },
];

const PersonalInfo : React.FC = () => {
    const [selected, setSelected] = useState<string | null>(null);
    const [usuario, setUsuario] = useState<Usuario | null>(null)

    const handleSelection = (id: string) => {
        setSelected(id);
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
            } catch (error: any) {
                console.log(error.message)
            }
        }
        fetchUser()
    }, [])

    return (
        <div className="flex justify-center">
            <div className="flex flex-col">
                <h1>Mi Perfil</h1>
                <div>
                    {usuario?.name}
                </div>
            </div>
            






            {images.map((image) => (
                <div
                key={image.id}
                className={`p-3 rounded-lg cursor-pointer ${selected === image.id && "bg-secondaryLight"}`}
                onClick={() => handleSelection(image.id)}
                >
                    <Image
                    key={image.id}
                    src={`/${image.src}.png`}
                    alt={`${image.name} opción`}
                    width={50}
                    height={50}
                    className="m-1"
                    />
                </div>
                
            ))}
        </div>
    )
}
export default PersonalInfo;