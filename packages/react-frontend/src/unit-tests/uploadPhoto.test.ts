import { beforeEach, expect, jest, test } from "@jest/globals";

const upload = jest.fn<(path: string, file: File, options: { contentType: string; upsert: boolean }) => Promise<{ error: Error | null }>>();
const getPublicUrl = jest.fn<(path: string) => { data: { publicUrl: string } }>();
const from = jest.fn(() => ({ upload, getPublicUrl }));

jest.unstable_mockModule("../supabase", () => ({
  supabase: { storage: { from } }
}));

const { uploadPhoto } = await import("../uploadPhoto");

beforeEach(() => {
  jest.clearAllMocks();
  upload.mockReset();
  getPublicUrl.mockReset();
});

test("rejects a non-image file without uploading it", async () => {
  const file = new File(["hello"], "notes.txt", { type: "text/plain" });

  await expect(uploadPhoto(file)).rejects.toThrow("Please select an image.");
  expect(from).not.toHaveBeenCalled();
});

test("rejects an image larger than 5 MB without uploading it", async () => {
  const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.png", { type: "image/png" });

  await expect(uploadPhoto(file)).rejects.toThrow("Image must be smaller than 5 MB.");
  expect(from).not.toHaveBeenCalled();
});
