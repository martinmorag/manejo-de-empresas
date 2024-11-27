"use client";

import React from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/outline';

const SignOutButton: React.FC = () => {
    const router = useRouter(); // Use the Next.js router

    const handleSignOut = async () => {
        await signOut({ redirect: false }); // Set redirect to false to handle redirection manually
        router.push('/'); // Redirect to the home page or any other page after sign-out
    };

    return (
        <button onClick={handleSignOut} className='flex justify-around px-4 py-2 hover:bg-gray-100 w-[100%] rounded-b-md'>
            <ArrowLeftStartOnRectangleIcon className="w-[24px] h-[24px] mr-2"/>
            <p>Cerrar Sesión</p>
        </button>
        
    );
}

export default SignOutButton;