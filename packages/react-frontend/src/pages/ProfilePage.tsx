import { useParams } from "react-router-dom";
import "../App.css";
import { useEffect, useState } from "react";
import PostsList from "../PostsList";
import { useAuth } from "../SessionContext";

export default function ProfilePage(){
  const { session, user} = useAuth();

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
  const [page_user, getUser] = useState<User>();
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

  if(!session || !user) return <p>Please log in.</p>;
  return (
    <div className="main">
      <h1>Profile</h1>
      <h2>Name: {page_user?.name}</h2>
      <h2>Contact: {page_user?.email}</h2>
      <p>hello I am {page_user?.name} and this is my amazing bio!</p>
      <br></br>
      <h2>{page_user?.name}'s Posts</h2>
      <PostsList user_id={uuid}/>
    </div>
  );
}