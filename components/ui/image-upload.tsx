"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string[]) => void;   // string[]
  onRemove: (url: string) => void;
  value: string[];                       // string[]
  multiple?: boolean;
}


const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  multiple = false,
  value,
  onChange,
  onRemove,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleUpload = (result: any) => {
    const url = result.info.secure_url as string;

    if (multiple) {
      onChange([...(value || []), url]); // append
    } else {
      onChange([url]); // replace
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        {value
          .filter((url) => typeof url === "string" && url.trim() !== "")
          .map((url) => (
            <div
              key={url}
              className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
            >
              <div className="z-10 absolute top-2 right-2">
                <Button
                  type="button"
                  onClick={() => onRemove(url)}
                  variant="destructive"
                  size="icon"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              <Image
                src={url}
                alt="Image"
                fill
                className="object-cover"
                sizes="200px"
                unoptimized
              />
            </div>
          ))}

      </div>


      <CldUploadWidget
        uploadPreset="penguin"
        onSuccess={(result: any) => handleUpload(result)}
      >
        {({ open }) => {
          const onClick = () => open();
          return (
            <Button
              type="button"
              disabled={disabled}
              variant="secondary"
              onClick={onClick}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Upload Image{multiple ? "s" : ""}
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;
