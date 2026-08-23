"use client";

import { useState } from "react";
import { getUploadUrl } from "@/app/actions";

interface Props {
  onUploadSuccess?: (url: string) => void;
}

export default function R2Uploader({ onUploadSuccess }: Props) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("Preparing upload...");

    try {
      // Ask our server for a pre-signed URL
      const { success, url, key, error } = await getUploadUrl(file.name, file.type);
      
      if (!success || !url) {
        throw new Error(error || "Failed to get upload URL");
      }

      setMessage("Uploading directly to Cloudflare...");

      // Upload the file directly to Cloudflare R2 using the URL
      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (uploadResponse.ok) {
        setMessage(`Success!`);
        // We inject the Cloudflare R2 Public Dev URL here
        const finalUrl = `https://pub-9120ad04596f4681846007d76e7b4dfc.r2.dev/${key}`;
        if (onUploadSuccess) onUploadSuccess(finalUrl);
      } else {
        throw new Error("Failed to upload to R2");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred during upload.");
    } finally {
      setUploading(false);
      // clear the message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-4">
        <input 
          type="file" 
          onChange={handleUpload} 
          disabled={uploading} 
          accept="image/*,video/*"
          className="text-xs file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1 file:text-xs file:font-semibold file:text-accent-foreground hover:file:bg-accent/80"
        />
        {message && <span className="text-xs text-muted-foreground">{message}</span>}
      </div>
    </div>
  );
}
