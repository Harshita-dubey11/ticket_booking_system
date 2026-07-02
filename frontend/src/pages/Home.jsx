import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (user.role === "admin") navigate("/admin", { replace: true });
    else if (user.role === "organiser") navigate("/organiser", { replace: true });
    else navigate("/events", { replace: true });
  }, [user, loading, navigate]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="home" style={{ textAlign: "center", paddingTop: "3rem" }}>
      <h1>Ticket Booking System</h1>
      <p style={{ margin: "1rem 0", color: "#666" }}>Book seats for movies and concerts with live seat maps.</p>
      <Link to="/events" className="btn-primary">Browse Events</Link>
      <span style={{ margin: "0 0.5rem" }}>or</span>
      <Link to="/login" className="btn-secondary">Login</Link>
    </div>
  );
}
