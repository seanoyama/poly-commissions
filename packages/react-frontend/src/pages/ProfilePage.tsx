import { useParams } from "react-router-dom";
import "../App.css";
import { useEffect, useState } from "react";

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
  const url = "http://localhost:8000/users/"+(uuid);
  // const postsUrl = "http://localhost:8000/posts/"+(uuid); //later should be changed to query instead of dynamic route
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
    </div>
  );
}