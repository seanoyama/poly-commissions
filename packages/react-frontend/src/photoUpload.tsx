import { useState } from "react";
import { uploadPhoto } from "./uploadPhoto";

type PhotoUploadProps = {
  onUpload: (url: string) => void;
};

export default function PhotoUpload({
  onUpload,
}: PhotoUploadProps) {
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setLoading(true);

    try {
      const url = await uploadPhoto(file);
      setPreview(url);
      onUpload(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <label htmlFor="post-photo">Upload a photo</label>

      <input
        id="post-photo"
        type="file"
        accept="image/*"
        onChange={handleChange}
      />

      {loading && <p>Uploading photo...</p>}
      {error && <p role="alert">{error}</p>}

      {preview && (
        <img
          src={preview}
          alt="Selected post"
          style={{ width: 200, objectFit: "cover" }}
        />
      )}
    </div>
  );
}