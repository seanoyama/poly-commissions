import "../App.css";
import { useParams } from "react-router";
import ChatsList from "../ChatsList";

export default function MessagesPage() {
  return (
    <div className="main">
      <h1>Messages</h1>
      <ChatsList/>
    </div>
  );
}
