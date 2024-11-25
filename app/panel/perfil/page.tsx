"use client";

import React from "react";
import EditPersonal from "@/app/ui/perfil/EditPersonal";

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
        <EditPersonal />
        </>
    )
} 

export default Page;