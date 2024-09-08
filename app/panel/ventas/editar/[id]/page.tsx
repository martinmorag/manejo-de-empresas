import React from "react";
import EditVenta  from "@/app/ui/ventas/EditVenta";

const Page : React.FC = () => {
    return (
        <div className="flex items-center justify-center my-[2rem] py-[2rem] w-[80vw] w-[100%] mx-auto shadow-black shadow-md rounded-md">
            <EditVenta />
        </div>
    )
}

export default Page;