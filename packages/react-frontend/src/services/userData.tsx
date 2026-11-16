import "../App.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type User = {
    id: string;
    name: string;
    email: string;
    phone: string;
    on_campus: boolean;
    created_at: string;
  }


export function UserName(props: any){
    const uuid = props.uuid;

  // make urls by concatenating with user id
  const url = "http://localhost:8000/users/"+(uuid);
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
    }, [uuid]);

  return <>
  {user?.name}
  </>

}