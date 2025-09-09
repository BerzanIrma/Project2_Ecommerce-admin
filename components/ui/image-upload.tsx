"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";
// import {CldUploadWidget} from "next-cloudinary" // Disabled due to ad-blocker issues

interface ImageUploadProps {
    disabled?: boolean;
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
    value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
   disabled,
   onChange,
   onRemove,
   value
}) => {
    const [isMounted, setIsMounted] = useState(false);
  
    useEffect(() => {
      setIsMounted(true);
    }, []);
  
  


    const handleRemove = (urlToRemove: string) => {
        onRemove(urlToRemove);
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                onChange(result);
            };
            reader.readAsDataURL(file);
        }
    }

    if (!isMounted) {
      return null;
    }


    return(
        <div>
            <div className="mb-4 flex items-center gap-4">
         {value.map((url) => (
           <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
            <div className="z-10 absolute top-2 right-2">
            <Button type="button" onClick={() => handleRemove(url)}  variant="destructive" size="icon">
                <Trash className="h-4 w-4"/>
            </Button>
            </div>
            <Image 
            fill
            className="object-cover"
            alt="image"
            src={url}
            />
           </div>
         ))}
            </div>
            {/* Simple input file */}
            <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={disabled}
                className="hidden"
                id="image-upload"
            />
            <Button
                type="button"
                disabled={disabled}
                variant="secondary"
                onClick={() => document.getElementById('image-upload')?.click()}
            >
                <ImagePlus className="h-4 w-4 mr-2" />
                Upload an image
            </Button>
        </div>
    )
};

 export default ImageUpload;