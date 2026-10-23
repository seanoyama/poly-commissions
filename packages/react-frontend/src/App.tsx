import "./App.css";
import LoginPage from "./pages/LoginPage";
import MessagesPage from "./pages/MessagesPage";
import PostsPage from "./pages/PostsPage";
import { BrowserRouter, Routes, Route } from "react-router";

function App() {
  return (
    <>
      <BrowserRouter>
        <div className="page">
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

            <form 
              action="http://localhost:5173/about" 
              method="get">
              <button className="navBarItem" type="submit">
                About
              </button>
            </form>

            <form 
              action="http://localhost:5173/login" 
              method="get">
              <button className="navBarItem" type="submit">
                Login
              </button>
            </form>
          </nav>
          <Routes>
            <Route
              path="/messages"
              element={<MessagesPage />}
            />
            <Route 
              path="/login" 
              element={<LoginPage />} 
            />
            <Route 
              path="/posts" 
              element={<PostsPage />} 
            />
          </Routes>

        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
