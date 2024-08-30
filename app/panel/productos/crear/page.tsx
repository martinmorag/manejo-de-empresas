import React from "react";
import CreateProduct from "@/app/ui/CreateProduct";

const Page : React.FC = () => {
    return (
        <div className="flex items-center justify-center mt-[2rem] py-[2rem] w-[45vw] w-[100%] mx-auto shadow-black shadow-md rounded-md">
            <CreateProduct />
        </div>
    )
}

export default Page;