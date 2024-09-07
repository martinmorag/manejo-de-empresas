"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const links = [
    {name: "Información Personal", href: "/panel/perfil"},
    {name: "Seguridad", href: "/panel/perfil/seguridad"}
]

const SideNav : React.FC = () => {
    const pathname = usePathname()

    return (
        <div className="flex flex-col bg-secondaryLight rounded-md p-2 m-2">
            {links.map((link) => {
                const isTrue = pathname === link.href;
                return (
                    <Link
                    href={`${link.href}`} 
                    className={`p-2 rounded-md
                    ${isTrue && "bg-secondaryLight2"}`}
                    >{link.name}</Link>
                )
            })}
        </div>
    )
}

export default SideNav;