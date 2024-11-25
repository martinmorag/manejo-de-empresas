import React from "react"
import Image from "next/image";
import SignIn from "@/app/ui/SignIn";
import { Metadata } from "next";

export const metadata : Metadata = {
    title: "Ingreso | Crece",
    description: "Bienvenido a Crece, acá va a poder organizar y mantener registros de su negocio actualizado y de manera eficiente.",
};

const Page : React.FC = () => {
    return (
        <div className="flex justify-start items-center min-h-[100vh] bg-[url('/background.png')] bg-cover bg-center h-64 w-full">
            <div className="flex flex-col w-[25vw] items-center">
                <Image 
                src="/logo.png"
                alt="Crece Logo"
                width={150}
                height={150}
                className="mb-5"
                />
                <div className="w-[20vw]">
                    <h1 className="mt-2 text-center text-[1.5rem]">Bienvenido</h1>
                    <p className="mt-2 text-center text-[1.1rem]">Por favor ingrese para continuar</p>
                    <hr  className="border-gray-400 my-[1rem]"/>
                    <SignIn  />
                </div>
            </div>
        </div>
    )
}

export default Page;