import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import SignOutButton from "./SignOut";
import { ProfileData } from "@/app/lib/definitions";
import { DropDownProps } from "@/app/lib/definitions";

const DropDown: React.FC<DropDownProps> = ({  session }) => {
  const [show, setShow] = useState(false);
  const [data, setData] = useState<ProfileData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/perfil/${session.user.id}`);
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await res.json();
        setData(data);
      } catch (error: any) {
          console.log(error.message);
      }
    };
  
      fetchData();
  }, [session?.user?.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShow(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownClick = () => {
    setShow(prev => !prev);
  };
  
  return (
    <div className="relative w-[12vw] h-full flex flex-col items-center justify-center">
      <div 
        ref={buttonRef}
        onClick={handleDropdownClick}
        className={"flex items-center justify-center h-[100%] cursor-pointer w-[50px] h-[auto] mr-[0.2rem]"}
      ><Image
      src={data?.profile_image ? data.profile_image : `/${data?.default_picture}.png`}
      alt="Foto de perfil"
      width={42}
      height={42}
      className="rounded-full"
      /></div>
      

      {show && (
        <div ref={dropdownRef} 
        className="absolute top-full mt-[0.5rem] right-[0.2rem] w-full bg-white shadow-lg rounded-md z-10">
          <Link href="/panel/perfil"><div className="px-4 py-2 hover:bg-gray-100 w-[100%] rounded-t-md text-center">
            Mi Perfil
          </div></Link>
          <SignOutButton /> 
        </div>
      )}
    </div>
  );
};

export default DropDown;