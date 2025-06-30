import React from "react"
import CreateVenta from "@/app/ui/ventas/CreateVenta";

const Page : React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center my-[2rem] py-[2rem] w-[80vw] w-[100%] mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Agregar venta</h2>
            <CreateVenta />
        </div>
    )
}

export default Page;