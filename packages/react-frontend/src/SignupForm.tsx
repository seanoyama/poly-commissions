import { useState, type FormEvent } from "react";

const API_URL = "http://localhost:8000";
const CAL_POLY_EMAIL = /^[^\s@]+@calpoly\.edu$/i;

type SignupResponse = {
  error?: string;
  id?: string;
  email?: string;
  name?: string;
};

export default function SignupForm() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!CAL_POLY_EMAIL.test(email)) {
      setError("Please use your @calpoly.edu email address.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const result = (await response.json()) as SignupResponse;

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to create your account.");
      }

      setMessage(`Account created for ${result.name ?? name}.`);
      event.currentTarget.reset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create your account."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="loginForm" onSubmit={handleSubmit}>
      <label htmlFor="name">Name</label>
      <input
        id="name"
        name="name"
        type="text"
        autoComplete="name"
        required
        disabled={isSubmitting}
      />

      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        disabled={isSubmitting}
      />

      <label htmlFor="password">New password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        disabled={isSubmitting}
      />

      {error && <p role="alert">{error}</p>}
      {message && <p>{message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
