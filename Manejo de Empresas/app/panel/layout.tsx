"use client"; 

import React from "react";
import { ReactNode } from "react";
import Header from "@/app/ui/Header";
import Footer from "@/app/ui/Footer";
import { useSession } from "next-auth/react";
import { Triangle } from 'react-loader-spinner'

interface LayoutProps {
    children: ReactNode;
};


const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                    <Triangle
                        visible={true}
                        height="80"
                        width="80"
                        color="#c2a15a"
                        ariaLabel="triangle-loading"
                        wrapperStyle={{ transform: 'rotate(180deg)' }}
                        wrapperClass=""
                    />
                    <p className="mt-2 font-bold text-xl">Cargando</p>
                </div>;
    }
    
    if (!session) {
    return <p>No ha ingresado sesión.</p>;
    }

    return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
            </div>
    );
}

export default Layout;