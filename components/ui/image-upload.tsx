"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";
// import {CldUploadWidget} from "next-cloudinary" // Disabled due to ad-blocker issues

interface ImageUploadProps {
    disabled?: boolean;
    onChange: (value: string) => void;
    onChangeMany?: (values: string[]) => void;
    onRemove: (value: string) => void;
    value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
   disabled,
   onChange,
   onChangeMany,
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputEl = e.currentTarget as HTMLInputElement | null;
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const readAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve((event.target?.result as string) || "");
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        try {
            const urls = await Promise.all(files.map(readAsDataUrl));
            const valid = urls.filter(Boolean);
            if (valid.length) {
                if (onChangeMany) onChangeMany(valid);
                else valid.forEach(u => onChange(u));
            }
        } finally {
            // reset input to allow re-uploading same file(s)
            if (inputEl && typeof inputEl.value !== 'undefined') {
                inputEl.value = "";
            }
        }
    }

    if (!isMounted) {
      return null;
    }


    return(
        <div>
            <div className="mb-4 flex items-center gap-4">
         {value.filter((u) => !!u && typeof u === 'string').map((url) => (
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
            src={url as string}
            />
           </div>
         ))}
            </div>
            {/* Simple input file */}
            <input
                type="file"
                accept="image/*"
                multiple
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
                Upload image(s)
            </Button>
        </div>
    )
};

 export default ImageUpload;