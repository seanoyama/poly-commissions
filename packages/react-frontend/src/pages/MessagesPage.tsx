import "../App.css";
import { useParams } from "react-router-dom";
import MessagesList from "../MessagesList";
//import ChatsList from "../ChatsList";

export default function MessagesPage() {
  const { chat_id } = useParams();
  return (
    <div className="main">
      <h1>Messages</h1>
      <MessagesList chat_id={chat_id} />
    </div>
  );
}
