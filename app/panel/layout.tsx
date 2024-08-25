"use client"; 

import React from "react";
import { ReactNode } from "react";
import Header from "@/app/ui/Header";
import { useSession } from "next-auth/react";

interface LayoutProps {
    children: ReactNode;
}



const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <p>Loading...</p>;
    }
    
    if (!session) {
    return <p>You are not signed in.</p>;
    }

    return (
            <div className="min-h-[100vh]">
                <Header session={session} />
                {children}
            </div>
    );
}

export default Layout;