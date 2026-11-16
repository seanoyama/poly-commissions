import { useEffect, useState} from "react";
import {UserName} from "./services/userData";
import ChatForm from "./ChatForm";

import {useAuth} from "./SessionContext";

// consider having a script that just has a bunch of types we use
type Post = {
        id: string;
        user_id: string;
        title: string;
        price: number;
        category: string;
        location: string;
        images: string;
    };

export default function SinglePost(props:any) {
    const id = props.id.uuid;
    const [refreshKey, setRefreshKey] = useState(0);

    const {user} = useAuth();

    
  // make urls by concatenating with post id
  const url = "http://localhost:8000/posts/" + id;
  console.log(url);
  const [post, getPost] = useState<Post>();
  useEffect(() => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load post");
        }

        return response.json() as Promise<Post>;
      })
      .then((data) => {
        getPost(data);
      })
      .catch((err: Error) => {
        console.log(err);
      });
  }, []);
  console.log(post?.images[0]);
  return (
    
    <>
      <h1>Post: {post?.title}</h1>
      <h2>{post?.category}</h2>
      <img src={post?.images[0]}></img>
      <p>Price: {post?.price}</p>
      <p>Create new chat with <UserName uuid={(post?.user_id)} />:</p>
      <ChatForm user_one={post?.user_id} user_two={user?.id} post_id={post?.id} onChatCreate={() => setRefreshKey((key) => key + 1)}/>
      </>
  );
}
