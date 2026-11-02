import { supabase } from "./supabase";

export async function uploadPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be smaller than 5 MB.");
  }

  const extension = file.name.split(".").pop() || "jpg";
  const fileName = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("images")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}