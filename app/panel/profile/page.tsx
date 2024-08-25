"use client";

import React, { useState, useEffect } from "react";
import { ProfileData } from "@/app/lib/definitions";

const Page : React.FC = () => {
    const [data, setData] = useState<ProfileData | null>(null);


    useEffect(() => {
    const fetchData = async () => {
        try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await res.json();
        console.log('API response:', data);
        setData(data[0]);
        } catch (error: any) {
            console.log(error.message);
        }
        
    };

    fetchData();
    }, []);

    return (
        <>
        <h1>data here</h1>
        <p>{data ? data.default_picture : "Loading..."}</p>
        </>
    )
} 

export default Page;