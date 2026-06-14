'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";

const Logo = () => {
    const router = useRouter();
    
    return (
        <Image
        onClick={()=>router.push('/')}
        alt="Logo"
        className="block h-8 w-auto cursor-pointer md:h-10"
        height="40"
        width="120"
        src="/Images/air1.png"
        priority/>
    )
}

export default Logo;