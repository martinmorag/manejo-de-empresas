import React from "react";
import EditVenta  from "@/app/ui/ventas/EditVenta";

const Page : React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center my-[2rem] py-[2rem] w-[80vw] w-[100%] mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Editar venta</h2>
            <EditVenta />
        </div>
    )
}

export default Page;