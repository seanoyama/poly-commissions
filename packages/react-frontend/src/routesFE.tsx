import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MessagesPage from "./pages/MessagesPage";
import PostsPage from "./pages/PostsPage";
import ProfilePage from "./pages/ProfilePage";
import { Routes, Route } from "react-router-dom";

export default function RoutesFE() {
  return (
    <Routes>
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/posts" element={<PostsPage />} />
      <Route path="/users/:uuid" element={<ProfilePage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}
