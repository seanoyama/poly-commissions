import { useEffect, useState } from "react";
import "./App.css";

type Post = {
  id: string;
  title: string;
  price: number;
  category: string;
  location: string;
  image: string;
};
export default function PostsList(props: any) {
  const user_id = props.user_id;
  const refreshKey = props.refreshKey;
  // url variable in case we go #public
  let API_URL = "http://localhost:8000";
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = `${API_URL}/posts`;
    if (user_id) {
      url += `?user_id=${encodeURIComponent(user_id)}`;
    }

    setLoading(true);
    setError("");

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load posts");
        }
        return response.json() as Promise<Post[]>;
      })
      .then((data) => {
        setPosts(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user_id, refreshKey]);

  return (
    <div className="posts-lists">
      {error && <p className="error-message">{error}</p>}
      {loading && posts.length === 0 && <p>Loading...</p>}
      {!loading && !error && posts.length === 0 && (
        <p>No posts yet.</p>
      )}

      <section className="posts-list-grid">
        {posts.map((post) => (
          <div>
            <article className="posts-list-card" key={post.id}>
            <img
              className="posts-list-image"
              src={post.image}
              alt={post.title}
            />

            <div className="posts-list-info">
              <h2>${post.price}</h2>
              <p className="posts-list-title">{post.title}</p>
              <p className="posts-list-details">
                {post.category} · {post.location}
              </p>
            </div>
          </article>
          <br></br>
          </div>
                    
        ))}
      </section>
    </div>
  );
}
