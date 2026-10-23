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
  // url variable in case we go #public
  let url = "http://localhost:8000/posts";
  if(user_id){ //if user_id is passed, filter posts by user_id
    url = url+"?user_id="+user_id;
    console.log(url);
  }
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string>(""); // unused so far

  useEffect(() => {
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
      });
  }, []);

  return (
    <div className="posts-lists">
      {error && <p className="error-message">{error}</p>}
      <section className="posts-list-grid">
        {posts.map((post) => (
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
        ))}
      </section>
    </div>
  );
}
