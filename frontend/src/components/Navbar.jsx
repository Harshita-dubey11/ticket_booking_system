import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-14 items-center px-4 gap-6">
        <Link to="/" className="font-bold text-lg text-primary">TicketBook</Link>

        <div className="flex items-center gap-1 ml-auto">
          <Link to="/events"><Button variant="ghost" size="sm">Events</Button></Link>
          {user ? (
            <>
              <Link to="/bookings"><Button variant="ghost" size="sm">My Bookings</Button></Link>
              <Link to="/waitlist"><Button variant="ghost" size="sm">Waitlist</Button></Link>
              {user.role === "admin" && <Link to="/admin"><Button variant="ghost" size="sm">Admin</Button></Link>}
              {(user.role === "organiser" || user.role === "admin") && <Link to="/organiser"><Button variant="ghost" size="sm">Organiser</Button></Link>}
              <span className="text-sm text-muted-foreground ml-2">{user.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="ml-2">Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/register"><Button size="sm">Register</Button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
