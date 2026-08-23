"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function getUploadUrl(fileName: string, contentType: string) {
  try {
    // Sanitize the file name to remove spaces and special characters
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    // Generate a unique file name to avoid overwrites
    const uniqueFileName = `${Date.now()}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: contentType,
    });

    // The presigned URL expires in 3600 seconds (1 hour)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return { success: true, url: signedUrl, key: uniqueFileName };
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return { success: false, error: "Failed to generate upload URL" };
  }
}
