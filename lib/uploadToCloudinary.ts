import cloudinary from "./cloudinary";

const MAX_SIZE = 5 * 1024 * 1024; 
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<{ url: string; publicId: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid image type");
  }

  if (file.size > MAX_SIZE) {
    throw new Error("Image too large (max 5MB)");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, resource_type: "image" },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      )
      .end(buffer);
  });
}



export function getOptimizedImage(publicId: string) {
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
  });
}

export function getSquareImage(publicId: string) {
  return cloudinary.url(publicId, {
    crop: "auto",
    gravity: "auto",
    width: 500,
    height: 500,
    fetch_format: "auto",
    quality: "auto",
  });
}
