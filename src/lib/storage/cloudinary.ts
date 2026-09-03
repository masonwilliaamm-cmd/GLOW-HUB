import "server-only";
import { v2 as cloudinary } from "cloudinary";

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Object storage isn't configured yet — set CLOUDINARY_CLOUD_NAME, " +
        "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local.",
    );
    this.name = "StorageNotConfiguredError";
  }
}

function isConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export async function uploadProductImage(file: File): Promise<string> {
  if (!isConfigured()) throw new StorageNotConfiguredError();

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "glow-hub/products",
  });

  return result.secure_url;
}
