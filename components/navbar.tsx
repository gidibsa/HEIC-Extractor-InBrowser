"use client";

//imports
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet";
import { Github as GithubIcon } from "lucide-react";
import { House } from 'lucide-react';
import { SearchSlash } from 'lucide-react';
import { GlobeLock } from 'lucide-react';
import { ModeToggle } from "./mode-toggle";
import { SquareMenu } from 'lucide-react';
import { Gift } from 'lucide-react';



export default function Navbar({ }): any {

    const iconStrokeWidth: number = 0.9;
    const iconSize:number = 70;
    const iconColor: string = "#3e9392";

  return (
    <nav className="fixed z-50 flex items-center justify-between w-full h-24 px-4 py-10 backdrop-blur-md bg-teal-500 bg-opacity-30 md:px-8 lg:px-12 xl:px-16 2xl:px-24 shadow-md">
      <Link href="/">
        <Image alt="logo" className="w-40 cursor-pointer dark:invert" src="/HEIC Converter Logo.png" height={100} width={170} />
      </Link>

      <div className="hidden gap-1 md:gap-2 lg:gap-4 md:flex">
        <Link href="/">
          <Button variant="ghost" className="font-normal text-md items-center">
            <span><House color={iconColor} size={iconSize} strokeWidth={iconStrokeWidth}/></span>
            <span>Home</span>
          </Button>
        </Link>

        <Link href="/about">
          <Button variant="ghost" className="font-normal text-md items-center">
            <span><SearchSlash color={iconColor} size={iconSize} strokeWidth={iconStrokeWidth}/></span>
            <span>About</span>
          </Button>
        </Link>

        <Link href="/privacy-policy">
          <Button variant="ghost" className="font-normal text-md items-center">
            <span><GlobeLock color={iconColor} size={iconSize} strokeWidth={iconStrokeWidth}/></span>
            <span>Privacy Policy</span>
          </Button>
        </Link>
                
      </div>

      <div className="items-center hidden gap-2 md:flex">
        <div suppressHydrationWarning>
          <ModeToggle />
        </div>

        
        <Link href="https://donate.stripe.com/5kA9D0fCig0E2vS3cc">
          <Button variant="default" className="items-center gap-5 rounded-full w-fit md:flex" size="lg">
            <span><Gift /></span>
            <span>Donate for Goodluck</span>            
          </Button>
        </Link>
        
        <Link href="https://github.com/gidibsa/HEIC-Converter-InBrowser.git">
          <Button variant="default" className="items-center gap-5 bg-orange-600 rounded-full w-fit md:flex" size="lg">
            <span>Github Repo</span>
            <span><Image alt="github-repo" className="w-iconStrokeWidth5 dark:invert" src="/github-logo/github-mark-white.svg" height={20} width={20} /></span>
          </Button>
        </Link>

        
      </div>

      {/* MOBILE NAV */}
      <Sheet>
        <SheetTrigger className="block p-3 md:hidden">
          <span className="text-2xl text-slate-950 dark:text-slate-200">
          <SquareMenu color={iconColor} size={iconSize/2} strokeWidth={iconStrokeWidth}/>
          </span>
        </SheetTrigger>
        <SheetContent className="w-[300px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle></SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>

          <div className="flex flex-col content-center w-full h-full py-5">
          <Link href="/">
            <Button variant="ghost" className="font-normal text-md items-center w-full my-2 py-2">
              <span><House color={iconColor} size={iconSize} strokeWidth={iconStrokeWidth}/></span>
              <span>Home</span>
            </Button>
          </Link>

          <Link href="/about">
            <Button variant="ghost" className="font-normal text-md items-center w-full my-2 py-2">
              <span><SearchSlash color={iconColor} size={iconSize} strokeWidth={iconStrokeWidth}/></span>
              <span>About</span>
            </Button>
          </Link>

          <Link href="/privacy-policy">
            <Button variant="ghost" className="font-normal text-md items-center w-full my-2 py-2">
              <span><GlobeLock color={iconColor} size={iconSize} strokeWidth={iconStrokeWidth}/></span>
              <span>Privacy Policy</span>
            </Button>
          </Link>

          <div suppressHydrationWarning className="flex items-center justify-center">
            <ModeToggle/>
          </div>
          
          <Link href="https://github.com/gidibsa/HEIC-Converter-InBrowser.git">
            <Button variant="default" className="items-center gap-2 bg-orange-600 rounded-full md:flex w-full my-2 py-2" size="lg">
              <span>Github Repo</span>
              <span><Image alt="github-repo" className="w-iconStrokeWidth5 dark:invert" src="/github-logo/github-mark-white.svg" height={20} width={20} /></span>
            </Button>
          </Link>

          <Link href="https://donate.stripe.com/5kA9D0fCig0E2vS3cc">
            <Button variant="default" className="items-center gap-5 rounded-full md:flex w-full my-2 py-2">
              <span><Gift /></span>
              <span>Donate for Goodluck</span>            
            </Button>
          </Link>

          </div>
          
        </SheetContent>
      </Sheet>


  
    </nav>
    

  );
}
