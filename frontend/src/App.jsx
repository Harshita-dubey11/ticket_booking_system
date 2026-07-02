import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import OrganiserDashboard from "./pages/OrganiserDashboard";
import EventBrowse from "./pages/EventBrowse";
import EventDetail from "./pages/EventDetail";
import Checkout from "./pages/Checkout";
import BookingHistory from "./pages/BookingHistory";
import WaitlistPage from "./pages/WaitlistPage";
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
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/checkout/:id" element={user ? <Checkout /> : <Login />} />
          <Route path="/bookings" element={user ? <BookingHistory /> : <Login />} />
          <Route path="/waitlist" element={user ? <WaitlistPage /> : <Login />} />
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
