import { useEffect, useState } from "react";
import "./App.css";
import {UserName} from "./services/userData";
import {ReadableDate} from "./services/dateConverter";

type Message = {
  id: string;
  chat_id: string;
  user_id: number;
  body: string;
  images: string;
  reply_to: string;
  created_at: string;
};

type User = {
    id: string;
    name: string;
    email: string;
    phone: string;
    on_campus: boolean;
    created_at: string;
}

export default function MessagesList(props: any) {
  const chat_id = props.chat_id;
  const refreshKey = props.refreshKey;
  // url variable in case we go #public
  let API_URL = "http://localhost:8000";
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = `${API_URL}/messages`;
    if (chat_id) {
      url += "?chat_id="+chat_id;
    }

    setLoading(true);
    setError("");

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load messages");
        }
        return response.json() as Promise<Message[]>;
      })
      .then((data) => {
        setMessages(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [chat_id, refreshKey]);

  return (
    <div>
      {error && <p className="error-message">{error}</p>}
      {loading && messages.length === 0 && <p>Loading...</p>}
      {!loading && !error && messages.length === 0 && (
        <p>No messages yet.</p>
      )}

      <section className="posts-list-grid">
        {messages.map((message) => (
          <div>
            <ReadableDate iso_string={(message.created_at)}/> <br></br>
            <UserName uuid={(message.user_id)} /> :
            <br></br>
             {message.body}
          <br></br>
          <br></br>
          </div>
                    
        ))}
      </section>
    </div>
  );
}
