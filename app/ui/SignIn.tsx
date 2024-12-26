"use client";

import React, { useState } from "react";
import { signIn } from 'next-auth/react';
import { useRouter } from "next/navigation";

const SignIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });
        setLoading(false);

        if (result?.error) {
            setError(result.error);
        } else if (result?.ok) {
            router.push('/panel');
        }
    };

    return ( 
        <form onSubmit={handleSubmit} className="flex flex-col">
            <label className="pb-[0.5rem] text-[1.25rem]">Email</label>
            <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required
                className="border h-[2rem] rounded-md px-2"
            />
            <label className="pb-[0.5rem] pt-[1rem] text-[1.25rem]">Contraseña</label>
            <input 
                type="password"
                value={password.trim()}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="border h-[2rem] rounded-md px-2"
            />
            <button 
                type="submit"
                className={`w-[50%] h-[2.8rem] border-[3px] border-solid border-main text-[1.2rem] rounded-lg mt-[2.5rem] transition-colors duration-300 ease-in-out ${
                    loading ? 'bg-main text-white' : 'hover:bg-main hover:text-white active:bg-main active:text-white'
                }`}
            >
                Ingresar
            </button>
            {error && <p className="text-[red] mt-2 text-lg">{error}</p>}
        </form>
    );
}

export default SignIn;