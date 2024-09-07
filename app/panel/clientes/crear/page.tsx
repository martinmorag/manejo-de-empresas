import React from "react";
import CreateClient from "@/app/ui/clientes/CreateClient";

const Page : React.FC = () => {
    return (
        <div className="flex items-center justify-center mt-[2rem] py-[2rem] w-[65vw] w-[100%] mx-auto shadow-black shadow-md rounded-md">
            <CreateClient />
        </div>
    )
}

export default Page;