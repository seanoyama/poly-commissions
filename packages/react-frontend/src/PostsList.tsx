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

type PostResponse = {
  posts_list: Post[];
};

// url variable in case we go #public
const url = "http://localhost:8000/posts"

export default function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string>(""); // unused so far

  useEffect(() => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load posts");
        }

        return response.json() as Promise<PostResponse>;
      })
      .then((data) => {
        setPosts(data.posts_list); {/* data.??? depends on what lillian res.sends in backend i think aka i can change it*/}
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, []);

  return (
    <main className="posts-lists">

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
    </main>
  );
}