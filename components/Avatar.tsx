"use client";

import Image from "next/image";

interface AvatarProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

const Avatar = ({ src, alt, width = 40, height = 40 }: AvatarProps) => {
  return (
    <div className="avatar">
      <div className="w-10 rounded-full">
        <Image src={src} alt={alt} width={width} height={height} referrerPolicy="no-referrer" />
      </div>
    </div>
  );
};

export default Avatar;

