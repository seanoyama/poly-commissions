import { useState, type FormEvent } from "react";

const API_URL = "http://localhost:8000";

type LoginResponse = {
  error?: string;
  user?: {
    email?: string | null;
  };
};

export default function LoginForm() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const result = (await response.json()) as LoginResponse;

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to log in.");
      }

      setMessage(`Logged in as ${result.user?.email ?? email}.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to log in."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="loginForm" onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        disabled={isSubmitting}
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        disabled={isSubmitting}
      />

      {error && <p role="alert">{error}</p>}
      {message && <p>{message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
