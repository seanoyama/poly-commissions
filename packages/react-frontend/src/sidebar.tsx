import { useAuth } from "./SessionContext";

export default function Sidebar() {
  const { user } = useAuth(); //add session
  const user_url = "http://localhost:5173/users/" + user?.id;
  return (
    <section className="sidebar">
      <a href={user_url}>Profile</a>
      <a href="http://localhost:5173/posts">Posts</a>
      <a href="http://localhost:5173/messages">Messages</a>
      <a href="http://localhost:5173/settings">Settings</a>
    </section>
  );
}
