import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import OrganiserDashboard from "./pages/OrganiserDashboard";
import EventBrowse from "./pages/EventBrowse";
import { useAuth } from "./context/AuthContext";
import "./index.css";

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<EventBrowse />} />
          {user?.role === "admin" && (
            <Route path="/admin" element={<AdminDashboard />} />
          )}
          {(user?.role === "organiser" || user?.role === "admin") && (
            <Route path="/organiser" element={<OrganiserDashboard />} />
          )}
        </Routes>
      </main>
    </>
  );
}
