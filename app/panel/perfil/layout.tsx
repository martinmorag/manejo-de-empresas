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
        <div className="flex">
            <div className="w-[20vw] h-[100%] m-1">
                <SideNav />
            </div>
            <div>
                {children}
            </div>
        </div>
    );
}

export default Layout;
