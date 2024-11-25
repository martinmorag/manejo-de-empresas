import React from "react";
import CreateProduct from "@/app/ui/productos/CreateProduct";

const Page : React.FC = () => {
    return (
        <div className="flex items-center justify-center my-[2rem] py-[2rem] w-[50vw] mx-auto shadow-black shadow-md rounded-md">
            <CreateProduct />
        </div>
    )
}

export default Page;