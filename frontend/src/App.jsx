import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import OrganiserDashboard from "./pages/OrganiserDashboard";
import MyEvents from "./pages/MyEvents";
import EventBrowse from "./pages/EventBrowse";
import EventDetail from "./pages/EventDetail";
import Checkout from "./pages/Checkout";
import BookingHistory from "./pages/BookingHistory";
import WaitlistPage from "./pages/WaitlistPage";
import NotFound from "./pages/NotFound";
import "./index.css";

export default function App() {
  return (
    <ErrorBoundary>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<EventBrowse />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/checkout/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
          <Route path="/waitlist" element={<ProtectedRoute><WaitlistPage /></ProtectedRoute>} />
          <Route path="/organiser" element={<ProtectedRoute roles={["organiser", "admin"]}><OrganiserDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/my-events" element={<ProtectedRoute roles={["organiser", "admin"]}><MyEvents /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </ErrorBoundary>
  );
}
