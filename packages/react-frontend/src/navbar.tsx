import {react_url} from "./constants"
export default function Navbar() {
  // const URL = "http://localhost:5173";
  return (
    <nav className="navbar">
      <h1 className="logo">
        <a href="/">PolyComms</a>
      </h1>
      <ul className="nav-list">
        <li>
          <a href={`${react_url}/`}>About</a>
        </li>
        <li>
          <a href={`${react_url}/login`}>Login</a>
        </li>
        <li>
          <a href={`${react_url}/signup`}>Sign Up</a>
        </li>
      </ul>
    </nav>
  );
}
