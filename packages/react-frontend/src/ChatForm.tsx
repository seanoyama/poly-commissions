import { useState, type FormEvent } from "react";
import {API_URL} from "./constants";
type Chat = {
  id: string;
  user_one: string;
  user_two: string;
  post_id: string;
  created_at: string;
};

type NewChat = Pick<Chat, "user_one" | "user_two" | "post_id">;

type ChatFormProps = {
  user_one?: string;
  user_two?: string;
  post_id?: string;
  onChatCreate: () => void;
};

const url = `${API_URL}/chats`;

export default function ChatForm({
  user_one,
  user_two,
  post_id,
  onChatCreate
}: ChatFormProps) {

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!user_one || !user_two || !post_id) { // this case should be impossible since someone not logged in wouldn't see the message form I think
        setError("User one, User two, or post id does not exist.");
        return;
        }

        const chat: NewChat = { user_one, user_two, post_id};

        setIsSubmitting(true);
        try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(chat)
        });

        if (!response.ok) {
            const details = await response.text();
            throw new Error(details || "Unable to create chat.");
        }


        onChatCreate();
        } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to send message.");
        } finally {
        setIsSubmitting(false);
        }
        
    }

    return (
        <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        <label>Create Chat: </label>
        <button type="submit" disabled={isSubmitting || !user_one || !user_two || !post_id}>
            {isSubmitting ? "Creating..." : "Create"}
        </button>
        </form>
    );
}