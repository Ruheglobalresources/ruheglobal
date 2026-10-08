"use client"
import { FcGoogle,    } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import facebook from "@/public/facebook.svg"
import Image from "next/image";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/route";
import { useSearchParams } from "next/navigation";
import { safeCallbackUrl } from "@/lib/callback-url";

export const Social = () => {
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"), DEFAULT_LOGIN_REDIRECT)
    const onClick = (provider: "google" | "github") => {
      signIn(provider, {
        callbackUrl
      });
    }
    return (
        <div className="flex items-center w-full gap-x-2">
           <Button size="lg" className="w-full" variant="outline" 
              onClick={() => onClick("google")}>
                <FcGoogle className="h-5 w-5" />
            </Button>
        </div>
    )
}