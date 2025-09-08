import type { SVGProps } from "react";
import Image from "next/image";

export function Logo(props: SVGProps<SVGSVGElement> & {width?: number, height?: number}) {
  return (
    <Image 
      src="/logo.png" 
      alt="CareerCraft AI Logo" 
      width={props.width || 24} 
      height={props.height || 24} 
      {...props} 
    />
  );
}
