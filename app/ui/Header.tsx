import React from "react";
import DropDown from "./DropDown";
import Image from "next/image";
import Link from "next/link";
import { DropDownProps } from "@/app/lib/definitions";


const Header : React.FC<DropDownProps> = ({ session }) => {
    return (
        <div className="flex justify-between items-center h-[9vh] bg-main">
            <div className="flex items-center">
                <Link href="/panel">
                <Image 
                src="/logo.png"
                alt="Logo"
                width={60}
                height={60}
                className="ml-5 my-auto"
                layout="intrinsic"
                /></Link>
                <p className="text-2xl text-secondary">Crece</p>
            </div>
            <div className="mx-auto text-secondary text-xl">
                <Link href="/panel" className="">Inicio</Link>
                <Link href="/panel/productos" className="mx-[3rem]">Productos</Link>
                <Link href="/panel/ventas">Ventas</Link>
            </div>
            <DropDown session={session} />
        </div>
    )
}

export default Header;