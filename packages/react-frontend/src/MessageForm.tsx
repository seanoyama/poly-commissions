import { useState, type FormEvent } from "react";

type Message = {
  id: string;
  chat_id: string;
  user_id: string;
  body: string;
  images: string;
  reply_to: string;
  created_at: string;
};

type NewMessage = Pick<Message, "chat_id" | "user_id" | "body">;

type MessageFormProps = {
  chat_id?: string;
  user_id?: string;
  onMessageSent: () => void;
};

const url = "http://localhost:8000/messages";

export default function MessageForm({
  chat_id,
  user_id,
  onMessageSent
}: MessageFormProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!chat_id || !user_id) { // this case should be impossible since someone not logged in wouldn't see the message form I think
      setError("A chat and signed-in user are required to send a message.");
      return;
    }

    const message: NewMessage = { body: body.trim(), chat_id, user_id };
    if (!message.body) {
      setError("Enter a message before sending.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || "Unable to send message.");
      }

      setBody("");
      onMessageSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Message </label>
      <input
        id="message-body"
        name="body"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        required
        disabled={isSubmitting}
      />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={isSubmitting || !chat_id || !user_id}>
        {isSubmitting ? "Sending..." : "Send"}
      </button>
    </form>
  );
}