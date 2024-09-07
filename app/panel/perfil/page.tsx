"use client";

import React, { useState, useEffect } from "react";
import { ProfileData } from "@/app/lib/definitions";
import PersonalInfo from "@/app/ui/perfil/PersonalInfo";

const Page : React.FC = () => {
    // const [data, setData] = useState<ProfileData | null>(null);


    // useEffect(() => {
    // const fetchData = async () => {
    //     try {
    //     const res = await fetch("/api/profile");
    //     if (!res.ok) {
    //         throw new Error('Network response was not ok');
    //     }
    //     const data = await res.json();
    //     console.log('API response:', data);
    //     setData(data[0]);
    //     } catch (error: any) {
    //         console.log(error.message);
    //     }
        
    // };

    // fetchData();
    // }, []);

    return (
        <>
        <PersonalInfo />
        </>
    )
} 

export default Page;