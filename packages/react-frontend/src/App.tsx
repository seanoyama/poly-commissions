import "./App.css";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import RoutesFE from "./routesFE";
import { BrowserRouter } from "react-router-dom";
import {AuthProvider} from "./SessionContext";

function App() {
  return (
    <>
    <AuthProvider>
      <BrowserRouter>
        <section className="page">
          <Sidebar />
          <Navbar />
          
          <RoutesFE />
        </section>
      </BrowserRouter>
    </AuthProvider>
    </>
  );
}

export default App;
