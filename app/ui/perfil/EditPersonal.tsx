"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Usuario, Negocio } from "@/app/lib/definitions";
import UploadProfile from "./UploadProfile";
import { useRouter } from "next/navigation";

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

const EditPersonal : React.FC = () => {
    const [formData, setFormData] = useState({
        usuario_name: '',
        usuario_lastname: '',
        usuario_picture: '',
        negocio_name: '',
        negocio_location: '',
        negocio_iva_percentage: '',
    })
    const [selected, setSelected] = useState<string | null>(null);
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [negocio, setNegocio] = useState<Negocio | null>(null);
    const [showEdit, setShowEdit] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const router = useRouter();

    const handleSelection = (id: string, src: string) => {
        setSelected(id);
        setUploadedImage(null);
        setFormData((prev) => ({
            ...prev,
            usuario_picture: src,
        }));
    };

    console.log("Image source:", {
        uploadedImage,
        usuario_picture: formData.usuario_picture,
        profile_image: usuario?.profile_image,
        default_picture: usuario?.default_picture,
    });

    const handleShowEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (showEdit) {
            setFormData((prev) => ({
                ...prev,
                usuario_picture: usuario?.profile_image || usuario?.default_picture || '',
            }))
            setUploadedImage(null);
            setSelected(null);
        }

        setShowEdit((prevShowEdit) => !prevShowEdit);
    };

    const handleInputChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name] :  value
        }))
    };

    const handleImageSubmit = (image: string) => {
        setUploadedImage(image);
        setFormData((prev) => ({
            ...prev,
            usuario_picture: image, // Set the uploaded image as the default picture
        }));
        setSelected(null); // Clear selection of default images
    };
    // console.log(formData)
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { usuario_picture, ...dataToSend } = formData;

        try {
            const response = await fetch("/api/perfil/usuario", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...dataToSend,
                    profileImage: uploadedImage || null, 
                    defaultPicture: selected ? formData.usuario_picture : null, 
                }),
            });

            if (!response.ok) {
                throw new Error("Error al actualizar el perfil.");
            }

            const result = await response.json();
            setShowEdit(false); // Hide edit form on success
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
        }
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
                setFormData(prev => ({
                    ...prev,
                    usuario_name: data.name || "",
                    usuario_lastname: data.lastname || "",
                }))
            } catch (error: any) {
                console.log(error.message)
            }
        }
        fetchUser()
    }, [])

    useEffect(() => {
        const fetchNegocio = async () => {
            try {
                const response =  await fetch("/api/negocio/perfil")
                if (!response.ok) {
                    throw new Error("No se encontró usuario")
                }           
                const data = await response.json()
                setNegocio(data);
                setFormData(prev => ({
                    ...prev,
                    negocio_name: data.name || "",
                    negocio_location: data.location || "",
                    negocio_iva_percentage: data.iva_percentage || "",
                }))
            } catch (error: any) {
                console.log(error.message)
            }
        }
        fetchNegocio()
    }, [])

    const resolvedImageSrc =
        uploadedImage || // Uploaded image takes priority
        (selected ? `/${formData.usuario_picture}.png` : null) || // Selected image
        usuario?.profile_image || // User's actual profile image
        (usuario?.default_picture ? `/${usuario.default_picture}.png` : null) || // Default profile picture
        "/default.png";

    return (
        <form onSubmit={handleSubmit} className="flex w-[100%] h-[100%]">
            <div className="flex flex-col items-start w-[50%] h-[100%]">
                <div className="flex flex-col w-[100%]">
                    <h1 className="my-[2rem] text-2xl mx-auto">Mi Perfil</h1>
                    <div className="flex justify-center items-center space-x-[2rem] px-2 my-5">
                        {uploadedImage ? (
                            <Image
                                src={uploadedImage}
                                alt="Uploaded image"
                                width={75}
                                height={75}
                                className={`rounded-full object-cover h-[75px] w-[75px] ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                                onLoadingComplete={() => setIsLoaded(true)}
                            />
                        ) : (
                            <Image
                                // src={`/${formData.usuario_picture || usuario?.profile_image || usuario?.default_picture || 'default'}.png`}
                                src={
                                //    formData?.usuario_picture // First priority: `formData.usuario_picture`
                                //        ? `/${formData.usuario_picture}.png`
                                //        : usuario?.profile_image // Second priority: Base64 `profile_image`
                                //            ? usuario.profile_image
                                //            : usuario?.default_picture // Third priority: `default_picture`
                                //                ? `/${usuario.default_picture}.png`
                                //                : '/default.png' // Fallback: Default placeholder
                                resolvedImageSrc || '/default.png'}
                                alt="Mi foto de perfil"
                                width={75}
                                height={75}
                                className={`rounded-full object-cover h-[75px] w-[75px] ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                                onLoadingComplete={() => setIsLoaded(true)}
                            />
                        )}
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
                    {showEdit && 
                        <div className="flex flex-wrap w-[80%] mx-auto gap-4">
                            {images.map((image) => (
                                <div
                                key={image.id}
                                className={`p-3 rounded-lg cursor-pointer ${selected === image.id && "bg-secondaryLight"}`}
                                onClick={() => handleSelection(image.id, image.src)}
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
                            <UploadProfile onImageSubmit={handleImageSubmit} />
                        </div>
                    }
                </div>
                {showEdit 
                ?
                <div className="flex flex-col justify-around my-5 w-[50%] h-[100%]">
                    <div>
                        <h3 className="text-xl">Nombre</h3>
                        <hr className="border border-solid border-main w-[10rem]" />
                        <input
                        name="usuario_name" 
                        type="text"
                        value={formData.usuario_name}
                        onChange={handleInputChange} 
                        className="mt-3 w-[50%] p-1 border rounded-md"
                        />
                    </div>
                    <div className="mt-8">
                        <h3 className="text-xl">Apellido</h3>
                        <hr className="border border-solid border-main w-[10rem]" />
                        <input
                        name="usuario_lastname" 
                        type="text" 
                        value={formData.usuario_lastname}
                        onChange={handleInputChange}
                        className="mt-3 w-[50%] p-1 border rounded-md"
                        />
                    </div>
                </div>
                :
                <div className="flex flex-col justify-around my-5 w-[50%] h-[100%]">
                    <div>
                        <h3 className="text-xl">Nombre</h3>
                        <hr className="border border-solid border-main w-[10rem]" />
                        <p className="mt-3">{usuario?.name}</p>
                    </div>
                    <div className="mt-8">
                        <h3 className="text-xl">Apellido</h3>
                        <hr className="border border-solid border-main w-[10rem]" />
                        <p className="mt-3">{usuario?.lastname}</p>
                    </div>
                </div>
                }
                
            </div>
            <div className="flex flex-col items-start w-[50%]">
                <div className="flex flex-col items-center w-[100%]">
                    <h2 className="text-2xl my-[2rem]">Mi Negocio</h2>
                </div>
                
                    {showEdit
                    ?
                    <div className="flex flex-col justify-around my-5 w-[100%] h-[100%]">
                        <div>
                            <h3 className="text-xl">Nombre</h3>
                            <hr className="border border-solid border-main w-[10rem]" />
                            <input
                            name="negocio_name"
                            type="text" 
                            className="mt-3 w-[50%] p-1 border rounded-md"
                            value={formData.negocio_name}
                            onChange={handleInputChange}
                            />
                        </div>
                        <div className="mt-8">
                            <h3 className="text-xl">Localización</h3>
                            <hr className="border border-solid border-main w-[10rem]" />
                            <input
                            name="negocio_location"
                            type="text" 
                            className="mt-3 w-[50%] p-1 border rounded-md"
                            value={formData.negocio_location}
                            onChange={handleInputChange}
                            />
                        </div>
                        <div className="mt-8">
                            <h3 className="text-xl">Porcentaje de IVA</h3>
                            <hr className="border border-solid border-main w-[10rem]" />
                            <input
                            name="negocio_iva_percentage"
                            type="number" 
                            className="mt-3 w-[50%] p-1 border rounded-md"
                            value={formData.negocio_iva_percentage}
                            onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    :
                    <div className="flex flex-col justify-around my-5 w-[100%] h-[100%]">
                        <div>
                            <h3 className="text-xl">Nombre</h3>
                            <hr className="border border-solid border-main w-[10rem]" />
                            <p className="mt-3">{negocio?.name}</p>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-xl">Localización</h3>
                            <hr className="border border-solid border-main w-[10rem]" />
                            <p className="mt-3">{negocio?.location}</p>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-xl">Porcentaje de IVA</h3>
                            <hr className="border border-solid border-main w-[10rem]" />
                            <p className="mt-3">{negocio?.iva_percentage} %</p>
                        </div>
                    </div>
                    }
                {showEdit && 
                    <button className="relative bottom-0 my-5 mr-0 border border-solid border-main rounded-md py-2 px-3"
                    >Guardar Cambios</button>
                }    
            </div>
        </form>
    )
}

export default EditPersonal;