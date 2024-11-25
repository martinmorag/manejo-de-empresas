import React from "react";
import Productos from "@/app/ui/productos/Productos";
import UploadCSV from "@/app/ui/productos/UploadCSV";
import Link from "next/link";
import { CubeIcon } from "@heroicons/react/24/outline";

const Page : React.FC = () => {
    return (
        <div className="flex flex-col justify-between items-center">
            <div className="flex justify-center items-center w-[85vw]">
                <Link 
                href="/panel/productos/crear"
                className="link flex justify-around items-center w-[190px] h-[2.8rem] text-lg border-solid border-main border-[3px] rounded-lg hover:bg-main hover:text-white transition-colors duration-300 ease-in-out"
                ><CubeIcon className="cube-icon w-[23px] h-[23px] text-main transition-colors duration-300 ease-in-out" />Nuevo Producto</Link>
                <h1 className="my-4 text-3xl text-main mx-auto">Productos</h1>
                <UploadCSV />
            </div>
            <div className="w-[85vw]">
                <Productos />
            </div>
        </div>
    )
}

export default Page;