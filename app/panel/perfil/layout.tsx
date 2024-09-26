import React, { ReactNode } from "react";
import { Metadata } from "next";
import SideNav from "@/app/ui/SideNav";

interface LayoutProps {
    children: ReactNode;
}

export const metadata : Metadata = {
    title: {
        template : "%s | Crece",
        default : "Crece"
    },
    description: "Bienvenido a Crece, acá va a poder organizar y mantener registros de su negocio actualizado y de manera eficiente."
}


const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex h-[100%]">
            <div className="w-[20vw] min-h-[88vh] flex flex-col justify-between m-4 bg-secondaryLight rounded-md">
                <SideNav />
            </div>
            <div className="w-[80vw] h-[100%] overflow-auto p-4">
                {children}
            </div>
        </div>
    );
}

export default Layout;
