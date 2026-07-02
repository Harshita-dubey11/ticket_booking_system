import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">TicketBook</Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/events">Events</Link>
            <Link to="/bookings">My Bookings</Link>
            <Link to="/waitlist">Waitlist</Link>
            {user.role === "admin" && <Link to="/admin">Admin</Link>}
            {(user.role === "organiser" || user.role === "admin") && <Link to="/organiser">Organiser</Link>}
            <span className="nav-user">{user.name} ({user.role})</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/events">Events</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
