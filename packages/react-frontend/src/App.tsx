import "./App.css";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import RoutesFE from "./routesFE";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <section className="page">
          <Sidebar />
          <Navbar />
          <RoutesFE />
        </section>
      </BrowserRouter>
    </>
  );
}

export default App;
