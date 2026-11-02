import { useState } from "react";
import "../App.css";
import PostsList from "../PostsList";
import PhotoUpload from "../photoUpload";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const CATEGORIES = ["Furniture", "Electronics", "Clothing", "Books", "Other"];

export default function PostsPage() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!image) {
      setError("Please upload a photo first.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price: Number(price),
          category,
          location,
          image,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail ?? "Could not create listing.");
      }

      setTitle("");
      setPrice("");
      setCategory("");
      setLocation("");
      setImage("");
      setMessage("Your listing was created!");
      setRefreshKey((k) => k + 1); // refetches the list + resets the uploader
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create listing."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="main">
      <h1>Posts</h1>

      <section className="loginForm">
        <h2>Create a listing</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Title 
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <br></br>
          <label>
            Price ($) 
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </label>
          <br></br>

          <label>
            Category 
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <br></br>

          <label>
            Location 
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </label>

          <PhotoUpload key={refreshKey} onUpload={setImage} />

          <button type="submit" disabled={submitting || !image}>
            {submitting ? "Creating..." : "Create listing"}
          </button>
        </form>
        <br></br>

        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
      </section>

      <PostsList refreshKey={refreshKey} />
    </div>
  );
}