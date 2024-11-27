import React, { useEffect, useRef, useState } from "react";
import DropDown from "./DropDown";
import Image from "next/image";
import Link from "next/link";
import { ProfileData } from "@/app/lib/definitions";
import { NewspaperIcon } from "@heroicons/react/24/outline";


const Header : React.FC = () => {
    const [data, setData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/perfil`);
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await res.json();
                setData(data);
            } catch (error: any) {
                console.log(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

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
        <div className="flex justify-between items-center h-[7.5vh] bg-main">
            <div className="flex items-center">
                <Link href="/panel">
                <Image 
                src="/logo.png"
                alt="Logo"
                width={50}
                height={50}
                className="ml-5 my-auto"
                layout="intrinsic"
                /></Link>
                <p className="text-xl text-secondary">Crece</p>
            </div>
            <div className="flex mx-auto text-secondary text-xl">
                <Link href="/panel" className="">Inicio</Link>
                <Link href="/panel/productos" className="mx-[2.5rem]">Productos</Link>
                {/* Dropdown with hover and delay */}
                <div
                    className="group inline-block relative"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    ref={dropdownRef}
                >
                    <Link href="/panel/ventas" className="group-hover:text-secondary">
                        Ventas
                    </Link>
                    <div
                        className={`absolute z-20 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-md mt-2 w-[170%] mx-auto ${isDropdownVisible ? 'block' : 'hidden'}`}
                    >
                        <Link
                            href="/panel/ventas"
                            className="block px-4 py-2 text-lg text-black text-center hover:bg-gray-100 rounded-t-md"
                        >Ventas
                        </Link>
                        <Link
                            href="/panel/clientes"
                            className="block px-4 py-2 text-lg text-black text-center hover:bg-gray-100"
                        >Clientes
                        </Link>
                        <Link
                            href="/panel/deudas"
                            className="block px-4 py-2 text-lg text-black text-center hover:bg-gray-100 rounded-b-md"
                        >Deudas
                        </Link>
                        </div>
                </div>
                <Link href="/panel/soporte" className="ml-[2.5rem]">Soporte</Link>
                {data?.level === "administrador" &&
                    <Link
                        href="/panel/anuncios"
                        className="mx-[2.5rem] flex items-center"
                    >
                        <div className="relative flex items-center group">
                            <NewspaperIcon className="w-6 h-6" />
                            <span className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 group-hover:ml-3 transition-all duration-300 ease-in-out whitespace-nowrap">Anuncios</span>
                        </div>
                    </Link>
                }
            </div>
            <DropDown
                profileImage={data?.profile_image}
                defaultPicture={data?.default_picture}
            />
        </div>
    )
}

export default Header;