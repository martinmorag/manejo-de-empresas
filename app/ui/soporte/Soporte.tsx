import React from "react";
import MensajeSoporte from "@/app/ui/soporte/MensajeSoporte";

const Soporte : React.FC = () => {

    return (
        <div className="w-full">
            <div
                className="flex flex-col mx-auto items-center justify-center w-full h-[20rem] bg-main"
                style={{
                    clipPath: "ellipse(100% 90% at 50% 0)",
            }}>
                <h1 className="text-white pb-2 text-3xl">Asistencia en línea</h1>
                <h2 className="text-white text-xl">Conectamos contigo para resolver cualquier duda</h2>
            </div>
            <MensajeSoporte />
        </div>

    )
}

export default Soporte;