import React from "react";
import Deudas from "@/app/ui/deudas/Deudas";

const Page : React.FC = () => {
    return (
        <div className="flex flex-col justify-between items-center">
            <div className="flex justify-center items-center w-[85vw]">
                <h1 className="my-4 text-3xl text-main mx-auto">Deudas</h1>
            </div>
            <div className="w-[85vw]">
                <Deudas />
            </div>
        </div>
    )
}

export default Page;