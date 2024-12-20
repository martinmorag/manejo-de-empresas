import React from "react";
import Link from "next/link";
import Ventas from "@/app/ui/ventas/Ventas";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

const Page : React.FC = () => {
    return (
        <div className="flex flex-col justify-between items-center">
            <div className="flex justify-center items-center w-[85vw]">
                <Link 
                href="/panel/ventas/crear" 
                className="link w-[180px] h-[2.8rem] flex justify-around items-center text-xl border-main border-[3px] border-solid rounded-lg hover:bg-main hover:text-white transition-colors duration-300 ease-in-out">
                <ShoppingCartIcon className="cube-icon w-[23px] h-[23px] text-main transition-colors duration-300 ease-in-out" />Nueva venta</Link>
                <h1 className="my-4 text-3xl text-main mx-auto">Ventas</h1>
                <div className="w-[180px]"></div>
            </div>
            <div className="w-[85vw]">
                <Ventas />
            </div>
        </div>
    )
}

export default Page;