import React from "react";
import CreateProduct from "@/app/ui/productos/CreateProduct";

const Page : React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center my-[2rem] py-[2rem] w-[50vw] mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Agregar producto</h2>
            <CreateProduct />
        </div>
    )
}

export default Page;