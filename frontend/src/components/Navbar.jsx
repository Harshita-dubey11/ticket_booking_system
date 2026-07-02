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
        <Link to="/" className="font-bold text-lg text-primary shrink-0">TicketBook</Link>

        <div className="hidden sm:flex items-center gap-1">
          <Link to="/events"><Button variant="ghost" size="sm">Events</Button></Link>
          {user && (
            <>
              <Link to="/bookings"><Button variant="ghost" size="sm">My Bookings</Button></Link>
              <Link to="/waitlist"><Button variant="ghost" size="sm">Waitlist</Button></Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden md:inline mr-1">{user.name}</span>
              {(user.role === "organiser" || user.role === "admin") && (
                <div className="hidden sm:flex items-center gap-1 mr-1">
                  <Link to="/my-events"><Button variant="ghost" size="sm">My Events</Button></Link>
                  <Link to="/organiser"><Button variant="ghost" size="sm">Create</Button></Link>
                </div>
              )}
              {user.role === "admin" && (
                <Link to="/admin"><Button variant="ghost" size="sm">Admin</Button></Link>
              )}
              <span className="text-xs text-muted-foreground/60 px-1 hidden sm:inline">{user.role}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
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
