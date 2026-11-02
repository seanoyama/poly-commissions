export default function Navbar() {
  const URL = "http://localhost:5173";
  return (
    <nav className="navbar">
      <h1 className="logo">
        <a href="/">PolyComms</a>
      </h1>
      <ul className="nav-list">
        <li>
          <a href={`${URL}/`}>About</a>
        </li>
        <li>
          <a href={`${URL}/login`}>Login</a>
        </li>
        <li>
          <a href={`${URL}/signup`}>Sign Up</a>
        </li>
      </ul>
    </nav>
  );
}
