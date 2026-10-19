//import { useEffect, useState } from "react";
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
import "../App.css";
import PostsList from "../PostsList";
import LoginPage from "./LoginPage";
import MessagesPage from "./MessagesPage";
import PostsPage from "./PostsPage";
import { BrowserRouter, Routes, Route } from "react-router";

function App() {
  //const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <body className="page">
          <div className="sidebar">
            <button>Profile</button>
            <form
              action="http://localhost:5173/posts"
              method="get">
              <button>Posts</button>
            </form>
            <form
              action="http://localhost:5173/messages"
              method="get">
              <button>Messages</button>
            </form>
            <button>Settings</button>
          </div>
          <nav className="navbar">
            <a>PolyComms</a>
            <a className="navBarItem">About</a>
            <a className="navBarItem">Login</a>
          </nav>
          <Routes>
            <Route
              path="/messages"
              element={<MessagesPage />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/posts" element={<PostsPage />} />
          </Routes>

          <div className="main">
            <PostsList />
          </div>
        </body>
      </BrowserRouter>
    </>
  );
}

export default App;
