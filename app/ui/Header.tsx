import React, { useRef, useState } from "react";
import DropDown from "./DropDown";
import Image from "next/image";
import Link from "next/link";
import { DropDownProps } from "@/app/lib/definitions";


const Header : React.FC<DropDownProps> = ({ session }) => {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        setIsDropdownVisible(true);
    };

    const handleMouseLeave = () => {
        const id = setTimeout(() => {
            setIsDropdownVisible(false);
        }, 800); // 2000 milliseconds = 2 seconds
        setTimeoutId(id);
    };

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
                {/* Dropdown with hover and delay */}
                <div
                    className="group inline-block relative mx-auto"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    ref={dropdownRef}
                >
                    <Link href="/panel/ventas" className="group-hover:text-secondary">
                        Ventas
                    </Link>
                    <div
                        className={`absolute bg-white shadow-md rounded-md mt-1 w-[150px] ${isDropdownVisible ? 'block' : 'hidden'}`}
                    >
                        <Link
                            href="/panel/ventas"
                            className="block px-4 py-2 text-lg text-black hover:bg-gray-100 rounded-t-md"
                        >
                            Ventas
                        </Link>
                        <Link
                            href="/panel/clientes"
                            className="block px-4 py-2 text-lg text-black hover:bg-gray-100"
                        >
                            Clientes
                        </Link>
                        <Link
                            href="/panel/deudas"
                            className="block px-4 py-2 text-lg text-black hover:bg-gray-100 rounded-b-md"
                        >
                            Deudas
                        </Link>
                    </div>
                </div>
                {/* end of dropdown with hover and delay */}
            </div>
            <DropDown session={session} />
        </div>
    )
}

export default Header;