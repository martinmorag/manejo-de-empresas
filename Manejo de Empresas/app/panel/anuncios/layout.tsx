import React, { ReactNode } from "react";
import { Metadata } from "next";

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
        <div>
            {children}
        </div>
    );
}

export default Layout;