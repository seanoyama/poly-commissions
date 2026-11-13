import { useEffect, useState } from "react";
import "./App.css";
import { useAuth } from "./SessionContext";

type Chat = {
  id: string;
  user_one: string;
  user_two: string;
  post_id: string;
  created_at: string;
};
export default function ChatsList(props: any) {
  const { session, user } = useAuth();
  const chat_id = props.chat_id;
  const refreshKey = props.refreshKey;
  // url variable in case we go #public
  let API_URL = "http://localhost:8000";
  let url = `${API_URL}/chats`;
    console.log(user);
    if (user) {
      url += `?user=${encodeURIComponent(user?.id)}`;
    }
    console.log(url);
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    

    setLoading(true);
    setError("");

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load chats");
        }
        return response.json() as Promise<Chat[]>;
      })
      .then((data) => {
        setChats(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [chat_id, refreshKey]);

  if (!session || !user)
    return <div>Please log in to view your messages.</div>;

  return (
    <div>
      {error && <p className="error-message">{error}</p>}
      {loading && chats.length === 0 && <p>Loading...</p>}
      {!loading && !error && chats.length === 0 && (
        <p>No chats yet.</p>
      )}

      <section className="posts-list-grid">
        {chats.map((chat) => (
          <div>
            <a
              href={`http://localhost:5173/messages/${chat.id}`}>
              Chat ID: {chat.id}
            </a>
            <br></br>
          </div>
        ))}
      </section>
    </div>
  );
}
