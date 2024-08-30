import React from "react";
import Productos from "@/app/ui/Productos";
import Link from "next/link";
import { CubeIcon } from "@heroicons/react/24/outline";

const Page : React.FC = () => {
    return (
        <div className="mx-auto w-[90vw] my-[2rem]">
            <Link 
            href="/panel/productos/crear"
            className="link flex justify-around items-center mb-5 w-[190px] h-[45px] text-lg border-solid border-main border-[3px] rounded-lg hover:bg-main hover:text-white transition-colors duration-300 ease-in-out"
            ><CubeIcon className="cube-icon w-[23px] h-[23px] text-main transition-colors duration-300 ease-in-out" />Nuevo Producto</Link>
            <Productos />
        </div>
    )
}

export default Page;