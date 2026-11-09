import "../App.css";
import { useParams } from "react-router";
import MessagesList from "../MessagesList";
import ChatsList from "../ChatsList";

export default function MessagesPage() {
  const { chat_id } = useParams();
  return (
    <div className="main">
      <h1>Chats</h1>
      <ChatsList/>
    </div>
  );
}
