import { useAuth } from "./SessionContext";
import {react_url} from "./constants"

export default function Sidebar() {
  const { user } = useAuth(); //add session
  const user_url = `${react_url}/users/` + user?.id;
  return (
    <section className="sidebar">
      <a href={user_url}>Profile</a>
      <a href={`${react_url}/posts`}>Posts</a>
      <a href={`${react_url}/messages`}>Messages</a>
      <a href={`${react_url}/settings`}>Settings</a>
    </section>
  );
}
