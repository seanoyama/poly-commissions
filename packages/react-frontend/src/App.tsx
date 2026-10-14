import { useEffect, useState } from "react";
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
import './App.css'
import PostsList from "./PostsList";

function App() {
  const [count, setCount] = useState(0)
  const url = "http://localhost:8000/posts"

  return (
    <>
      <body className="page">
        <div className="sidebar">
        <button>Profile</button>
        <button>Posts</button>
        <button>Messages</button>
        <button>Settings</button>
      </div>
      <nav className="navbar">
        <a>PolyComms</a>
        <a className="navBarItem">About</a>
        <a className="navBarItem">Login</a>
      </nav>

      <div className="main">
        <PostsList />
      </div>
      </body>
    </>
  )
}



export default App
