import { storage } from "../config/firebase.ts";
import { v4 as uuid } from "uuid";

export async function uploadImage(
  imagePath: any,
  folder: "documents" | "profiles"
) {
  try {
    if (!imagePath || !folder) {
      throw new Error("Image and folder are required");
    }
    const bucket = storage.storage().bucket();
    const fileName = uuid() + ".jpg";

    await bucket.upload(imagePath, {
      destination: `${folder}/${fileName}`,
      metadata: {
        contentType: "image/jpeg",
      },
    });

    const file = bucket.file(`${folder}/${fileName}`);
    const config: any = {
      action: "read",
      expires: "03-01-2500",
    };
    const [url] = await file.getSignedUrl(config);

    return url;
  } catch (error) {
    throw error;
  }
}
export async function removeImage(url: string) {
  try {
    const filePath = getFilePathFromURL(url);
    if (!filePath) {
      console.error("Invalid image URL.");
      return;
    }
    const file = storage.storage().bucket().file(filePath);
    await file.delete();
    console.log("Image removed successfully.");
  } catch (error) {
    throw error;
  }
}
function getFilePathFromURL(url: any) {
  const regex = /https:\/\/storage\.googleapis\.com\/[^/]+\/(.+)\?.+/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
