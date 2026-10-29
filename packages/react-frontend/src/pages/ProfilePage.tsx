import { useParams } from "react-router-dom";
import "../App.css";
import { useEffect, useState } from "react";
import PostsList from "../PostsList";

export default function ProfilePage(){
  type User = {
    id: string;
    name: string;
    email: string;
    phone: string;
    on_campus: boolean;
    created_at: string;
  }

  const { uuid } = useParams();
  // make urls by concatenating with user id
  const url = "http://localhost:8000/users/"+(uuid);
  const postsUrl = "http://localhost:8000/posts?user_id="+(uuid);
  const [user, getUser] = useState<User>();
  useEffect(() => {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Could not load user");
          }
  
          return response.json() as Promise<User>;
        })
        .then((data) => {
          getUser(data);
        })
        .catch((err: Error) => {
          console.log(err);
        });
    }, []);
  return (
    <div className="main">
      <h1>Profile</h1>
      <h2>Name: {user?.name}</h2>
      <h2>Contact: {user?.email}</h2>
      <p>hello I am {user?.name} and this is my amazing bio!</p>
      <br></br>
      <h2>{user?.name}'s Posts</h2>
      <PostsList user_id={uuid}/>
    </div>
  );
}