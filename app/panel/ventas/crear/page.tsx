import React from "react"
import CreateVenta from "@/app/ui/ventas/CreateVenta";

const Page : React.FC = () => {
    return (
        <div className="flex items-center justify-center my-[2rem] py-[2rem] w-[80vw] w-[100%] mx-auto shadow-black shadow-md rounded-md">
            <CreateVenta />
        </div>
    )
}

export default Page;