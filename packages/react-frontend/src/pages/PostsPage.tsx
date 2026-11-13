import Posts from "../posts";
import "../App.css";
import Checkout from "../paypal";

export default function PostsPage() {
  return (
    <div className="main">
      <h1>Posts</h1>
      <Posts />
    </div>
  );
}
