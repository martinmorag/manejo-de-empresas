import React from "react";
import Link from "next/link";

const Page : React.FC = () => {
    return (
        <div className="flex flex-col items-center">
            <div className="flex justify-between items-center w-[85vw]">
                <h1 className="my-4 text-3xl text-main">Ventas</h1>
                <Link href="/panel/ventas/crear" className="w-[170px] h-[2.8rem] flex justify-center items-center text-xl  border-main border-[3px] border-solid rounded-lg hover:bg-main hover:text-white transition-colors duration-300 ease-in-out">
                Nueva venta</Link>
            </div>
            <div className="flex justify-around items-center w-[85vw] h-[7rem] bg-gray-200 rounded-md shadow-md shadow-gray-400">
                <div className="text-center text-xl">
                    <h3>Cantidad de ventas</h3>
                    <p>24</p>
                </div>
                <div className="text-center text-xl">
                    <h3>Cobrado</h3>
                    <p className="text-[#1B9D46]">$56.000</p>
                </div>
                <div className="text-center text-xl">
                    <h3>Total vendido</h3>
                    <p className="text-[#22007C]">$578.000</p>
                </div>
            </div>
        </div>
    )
}

export default Page;