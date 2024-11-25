import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer : React.FC = () => {
    return (
        <div className="flex justify-between items-center w-full h-auto bg-main text-secondary text-md p-2 px-[10%]">
            <div className="flex flex-col my-4">
                <Link href="/panel">Inicio</Link>
                <Link href="/panel/productos">Productos</Link>
                <Link href="/panel/ventas">Ventas</Link>
                <Link href="/panel/clientes">Clientes</Link>
                <Link href="/panel/deudas">Deudas</Link>
                <Link href="/panel/contacto">Contacta a Soporte</Link>
            </div>
            <div>
                <Image src="/logo.png" alt="Logo Image" width="90" height="50" layout="intrinsic"/>
            </div>
        </div>
    )
}

export default Footer;