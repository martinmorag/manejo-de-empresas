import React from "react";
import EditProduct from "@/app/ui/productos/EditProduct";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

const Page : React.FC = () => {
    return (
        <div className="flex items-center justify-center mt-[2rem] py-[2rem] w-[45vw] w-[100%] mx-auto shadow-black shadow-md rounded-md">
            <Link 
            href="/panel/productos"
            className="absolute left-5 top-[5rem] flex justify-around items-center w-[120px] h-[60px] border-solid border-[3px] border-main rounded-xl text-lg pr-2"
            ><ChevronLeftIcon className="text-main w-[30px] h-[30px]" />
            Volver</Link>
            <EditProduct />
        </div>
    )
}

export default Page;