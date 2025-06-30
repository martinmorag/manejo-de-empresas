import React from "react";
import CreateClient from "@/app/ui/clientes/CreateClient";

const Page : React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center my-[2rem] py-[2rem] w-[65vw] w-[100%] mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Agregar cliente</h2>
            <CreateClient />
        </div>
    )
}

export default Page;