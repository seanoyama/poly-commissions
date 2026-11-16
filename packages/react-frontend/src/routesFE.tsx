import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MessagesPage from "./pages/MessagesPage";
import PostsPage from "./pages/PostsPage";
import ProfilePage from "./pages/ProfilePage";
import ChatsPage from "./pages/ChatsPage";
import PostInfoPage from "./pages/PostInfoPage";
import { Routes, Route } from "react-router-dom";

export default function RoutesFE() {

  return (
    <Routes>
      <Route path="/messages" element={<ChatsPage />} />
      <Route path="/messages/:chat_id" element={<MessagesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/posts" element={<PostsPage />} />
      <Route path="/posts/:uuid" element={<PostInfoPage />} />
      <Route path="/users/:uuid" element={<ProfilePage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}
