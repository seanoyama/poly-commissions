import "../App.css";

import SinglePost from "../singlePost";
import {useParams} from "react-router-dom";

export default function ProfilePage() {
  const uuid = useParams();
    return (
    <div className="main">
      <SinglePost id={uuid} />
    </div>
  );
}
