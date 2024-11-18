'use client';

//imports
import Image from "next/image";
import Dropzone from "@/components/dropzone";
import { BackgroundBeams } from "@/components/ui/background-beams";


export default function Home() {
  return (
    <main className="space-y-16 pb-8">
      {/* Title+Description */}
      <div className="space-y-6">
        <h1 className="text-3xl md:text-5xl font-medium text-center">HEIF/HEIC Extractor</h1>
        <p className="text-muted-foreground text-md md:text-lg text-center md:px-24 xl:px-44 2xl:px-52">
          Extract frames from .heic image format and convert to both image formats and video formats. Took a photo using live mode 
          on the iPhone? You can select which of the frames you want to take out from the burst of photos taken.
        </p>
      </div>

      {/* Dropzone logic for uploads and files display */}
      
      <Dropzone />

      {/* Z-position for the background beam component is essential to not blocking the UI from clicks */}
      <BackgroundBeams className="-z-50"/> 
      
      
    </main>
  );
}
