import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import SignOutButton from "./SignOut";
import { DropDownProps } from "@/app/lib/definitions";

const DropDown: React.FC<DropDownProps> = ({ profileImage, defaultPicture }) => {
  const [show, setShow] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Create an instance of the HTMLImageElement
    const img: HTMLImageElement = new window.Image(); // Explicitly typing the `Image` object
    const src = profileImage || `/${defaultPicture}.png`;

    img.src = src;

    img.onload = () => {
      setImageSrc(src); // Assign the image source only after it has loaded
      setIsImageLoaded(true);
    };

    img.onerror = () => {
      console.error("Failed to load the image.");
      setIsImageLoaded(true); // Hide the spinner even if the image fails to load
    };
  }, [profileImage, defaultPicture]);


  return (
    <div className="relative w-[12vw] h-full flex flex-col items-center justify-center">
      <div
          ref={buttonRef}
          onClick={handleDropdownClick}
          className={"flex items-center justify-center h-[100%] cursor-pointer w-[50px] h-[auto] mr-[0.2rem]"}
      >
        <div className="relative w-[42px] h-[42px] flex items-center justify-center">
          {!isImageLoaded && (
              <div className="shimmer-circle rounded-full w-full h-full"></div>
          )}
          {imageSrc && (
              <Image
                  src={imageSrc}
                  alt="Profile Image"
                  width={42}
                  height={42}
                  className="rounded-full"
              />
          )}
        </div>
      </div>

      {show && (
          <div ref={dropdownRef}
               className="absolute top-full mt-[0.5rem] right-[0.2rem] w-fit bg-white shadow-lg rounded-md z-10">
            <Link href="/panel/perfil" onClick={() => setShow(false)}>
              <div className="px-4 py-2 hover:bg-gray-100 w-[100%] rounded-t-md text-center">
                Mi Perfil
              </div>
            </Link>
            <SignOutButton/>
          </div>
      )}
    </div>
  );
};

export default DropDown;