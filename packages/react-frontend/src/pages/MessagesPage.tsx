import "../App.css";
import { useParams } from "react-router";
import MessagesList from "../MessagesList";
import {useAuth} from "../SessionContext";


// const {session, user} = useAuth();

export default function MessagesPage() {
  const { chat_id } = useParams();
  // if(!session || !user) return <p>You are not logged in!</p>;
  return (
    <div className="main">
      <h1>Messages</h1>
      {/* <p>Logged in as {user?.email}</p> */}
      <MessagesList chat_id={chat_id}/>
    </div>
  );
}
