import "../App.css";
import { useState } from "react";
import { useParams } from "react-router-dom";
import MessagesList from "../MessagesList";
import MessageForm from "../MessageForm";
import { useAuth } from "../SessionContext";

export default function MessagesPage() {
  const { user } = useAuth();
  const { chat_id } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="main">
      <h1>Messages</h1>
      <MessagesList chat_id={chat_id} refreshKey={refreshKey} />
      <MessageForm
        chat_id={chat_id}
        user_id={user?.id}
        onMessageSent={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  );
}
