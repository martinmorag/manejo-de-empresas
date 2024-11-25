import { Metadata } from "next";
import Overview from "@/app/ui/Overview";
import Image from "next/image";
import UltimasVentas from "@/app/ui/tablas/UltimasVentas";
import NetRevenue from "@/app/ui/tablas/NetRevenue";
import ByProducts from "@/app/ui/tablas/ByProducts";
import AccesoDirecto from "@/app/ui/tablas/AccesoDirecto";

export const metadata : Metadata = {
  title: "Crece",
  description: "Bienvenido a Crece, acá va a poder organizar y mantener registros de su negocio actualizado y de manera eficiente."
}


const Page = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-around items-center mx-auto w-[12vw] my-7">
        <Image 
        src="/logo.png"
        alt="Logo de Sitio Web"
        width={60}
        height={60}
        />
        <h1 className="text-3xl text-main font-bold">Crece</h1>
      </div>
      <div className="flex justify-between items-center w-[85vw]">
        <Overview />
      </div>
      <div className="flex flex-col w-[85vw] mt-[6rem]">
        <AccesoDirecto />
      </div>
      <div className="flex justify-around my-8 w-[60vw] ">
        <NetRevenue />
        <ByProducts />
        
      </div>
    </div>
  );
};

export default Page;