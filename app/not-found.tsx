import Link from 'next/link';
import { FaceFrownIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
    return (
        <main className="w-screen h-screen flex flex-col justify-center items-center text-main">
            <div className="flex">
                <h1 className="text-3xl mr-2">Página no encontrada</h1>
                <FaceFrownIcon className="w-8 h-8"/>
            </div>
            <Link href="/panel" className="text-2xl m-4 py-2 px-3 border border-4 rounded-lg">Volver a Inicio</Link>
        </main>
    )
};