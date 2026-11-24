import { supabase } from "@/lib/supabase";

// Profile pictures, in Supabase Storage (supabase/migrations/…_profile_pictures.sql).

export const AVATAR_BUCKET = "avatars";
const SIZE = 512;
const MAX_FILE_BYTES = 25 * 1024 * 1024;

export const avatarUrl = (path: string) => supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;

/**
 * The middle square of a picture as a small JPEG. Redrawing it also drops hidden details
 * like where a photo was taken. Throws an Error with a readable message.
 */
export async function prepareAvatar(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a picture.");
  if (file.size > MAX_FILE_BYTES) throw new Error("That picture is too large. Please choose one under 25 MB.");
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error("We couldn’t open that picture. Try a JPEG or PNG."); });
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = SIZE;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("We couldn’t open that picture. Try a different browser.");
    const side = Math.min(bitmap.width, bitmap.height);
    context.fillStyle = "white"; // JPEGs can't be see-through
    context.fillRect(0, 0, SIZE, SIZE);
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (!blob) throw new Error("We couldn’t open that picture. Try a JPEG or PNG.");
    return blob;
  } finally { bitmap.close(); }
}
