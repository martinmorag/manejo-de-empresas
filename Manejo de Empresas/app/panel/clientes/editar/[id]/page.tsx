import React from "react";
import EditClient from "@/app/ui/clientes/EditClient";

const Page : React.FC = () => {
    return (
        <div className="flex items-center justify-center mt-[2rem] py-[2rem] w-[65vw] w-[100%] mx-auto shadow-black shadow-md rounded-md">
            <EditClient />
        </div>
    )
}

export default Page;