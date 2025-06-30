import React from "react";
import EditProduct from "@/app/ui/productos/EditProduct";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

const Page : React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center my-[2rem] py-[2rem] w-[45vw] w-[100%] mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
            <Link 
            href="/panel/productos"
            className="absolute left-5 top-[5rem] flex justify-around items-center w-[120px] h-[60px] border-solid border-[3px] border-main rounded-xl text-lg pr-2"
            ><ChevronLeftIcon className="text-main w-[30px] h-[30px]" />
            Volver</Link>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Editar producto</h2>
            <EditProduct />
        </div>
    )
}

export default Page;