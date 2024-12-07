import React from "react";

const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function OverviewSkeleton()  {
    return (
        <>
            <div className="flex flex-col w-full">
                <div
                    className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-200 p-2 shadow-sm h-[3rem] w-full`}>
                </div>
                <hr className='border border-[#A5A5A5] my-2'/>
                <div
                    className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-200 p-2 shadow-sm h-[5rem] w-full`}>
                </div>
            </div>
        </>
    )
}

export function AccesosDirectosSkeleton()  {
    return (
        <>
            <div className="flex flex-col w-full">
                <div className="flex justify-between">
                    <div
                        className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-200 p-2 shadow-sm h-[1.75rem] w-[8rem]`}>
                    </div>
                    <div
                        className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-200 p-2 shadow-sm h-[1.75rem] w-[2rem]`}>
                    </div>
                </div>
                <hr className='border border-[#A5A5A5] my-2'/>
                <div
                    className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-200 p-2 shadow-sm h-[2.5rem] w-full`}>
                </div>
            </div>
        </>
    )
}

export function TablesPCSkeleton() {
    return (
        <>
            <div
                className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-200 p-2 shadow-sm h-[2rem] w-full`}>
            </div>
            <div
                className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-200 mt-5 p-2 shadow-sm h-[50vh] w-full`}>
            </div>
        </>
    )
}

export function TablesVentasSkeleton() {
    return (
        <>
            <div className="flex justify-between">
                <div className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-200 p-2 shadow-sm h-[2rem] w-[10rem]`}></div>
                <div className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-200 p-2 shadow-sm h-[2rem] w-[10rem]`}></div>
            </div>
            <div
                className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-200 mt-5 p-2 shadow-sm h-[2rem] w-full`}>
            </div>
            <div
                className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-200 mt-5 p-2 shadow-sm h-[45vh] w-full`}>
            </div>
        </>
    )
}

export default function TablesDeudasSkeleton() {
    return (
        <>
            <div className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-200 p-2 shadow-sm h-[2rem] w-[10rem]`}></div>
            <div
                className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-200 mt-5 p-2 shadow-sm h-[2rem] w-full`}>
            </div>
            <div
                className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-200 mt-5 p-2 shadow-sm h-[45vh] w-full`}>
            </div>
        </>
    )
}