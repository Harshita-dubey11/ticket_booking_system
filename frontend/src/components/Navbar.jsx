import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

function Avatar({ name, className = "" }) {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full gradient-primary text-white text-xs font-semibold shrink-0 ${className}`}>
      {initials}
    </span>
  );
}

function DropdownMenu({ trigger, items, align = "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="focus:outline-none">
        {trigger}
      </button>
      {open && (
        <div className={`absolute top-full mt-2 ${align === "right" ? "right-0" : "left-0"} w-56 bg-white rounded-xl shadow-xl border border-border/60 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200`}>
          {items.map((item, i) =>
            item.separator ? (
              <div key={i} className="h-px bg-border mx-2 my-1" />
            ) : (
              <Link
                key={i}
                to={item.to}
                onClick={() => { setOpen(false); item.onClick?.(); }}
                className={`flex items-center gap-3 px-3 py-2 mx-1.5 rounded-lg text-sm transition-colors ${item.variant === "danger" ? "text-destructive hover:bg-destructive/10" : "text-foreground/80 hover:bg-accent hover:text-foreground"}`}
              >
                {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
                {item.label}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const isActive = (path) => location.pathname.startsWith(path);

  const createItems = [];
  if (user?.role === "admin") {
    createItems.push(
      { to: "/admin/create", label: "New Venue", icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
      { to: "/admin/create", label: "Add Category", icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg> },
    );
  } else if (user?.role === "organiser") {
    createItems.push(
      { to: "/organiser/create", label: "New Event", icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
      { to: "/organiser/create", label: "Set Pricing", icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    );
  }

  const userMenuItems = user
    ? [
        { to: "/bookings", label: "My Bookings", icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
        { to: "/waitlist", label: "Waitlist", icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> },
        ...(user.role === "admin" ? [{ to: "/admin", label: "Admin Panel", icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> }] : []),
        { separator: true },
        {
          to: "#",
          label: "Logout",
          onClick: handleLogout,
          variant: "danger",
          icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg> },
      ]
    : [];

  return (
    <nav className="sticky top-0 z-50 w-full glass">
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4 sm:px-6 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <span className="gradient-primary text-white text-xs w-7 h-7 rounded-lg flex items-center justify-center">TB</span>
          <span className="hidden sm:inline bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">TicketBook</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 ml-4">
          <Link to="/events" className={`nav-link ${isActive("/events") && !isActive("/events/") ? "active" : ""}`}>Events</Link>
          {user && (
            <>
              <Link to="/bookings" className={`nav-link ${isActive("/bookings") ? "active" : ""}`}>Bookings</Link>
              <Link to="/waitlist" className={`nav-link ${isActive("/waitlist") ? "active" : ""}`}>Waitlist</Link>
            </>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`}>Admin</Link>
          )}
          {(user?.role === "organiser" || user?.role === "admin") && (
            <Link to="/my-events" className={`nav-link ${isActive("/my-events") ? "active" : ""}`}>My Events</Link>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Create dropdown (desktop) */}
          {createItems.length > 0 && (
            <div className="hidden md:block">
              <DropdownMenu
                align="right"
                trigger={
                  <Button size="sm" className="gradient-primary text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span className="hidden sm:inline">Create</span>
                  </Button>
                }
                items={createItems}
              />
            </div>
          )}

          {/* User menu */}
          {user ? (
            <DropdownMenu
              align="right"
              trigger={
                <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-accent/60 transition-colors">
                  <Avatar name={user.name} />
                  <span className="hidden sm:inline text-sm font-medium text-foreground/80 max-w-[100px] truncate">{user.name}</span>
                  <svg className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              }
              items={userMenuItems}
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link to="/register"><Button size="sm" className="gradient-primary text-white shadow-md shadow-indigo-500/20">Sign up</Button></Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="md:hidden p-1.5 rounded-lg hover:bg-accent" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/60 bg-white px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
          <MobileLink to="/events" onClick={() => setMobileOpen(false)}>Events</MobileLink>
          {user && (
            <>
              <MobileLink to="/bookings" onClick={() => setMobileOpen(false)}>Bookings</MobileLink>
              <MobileLink to="/waitlist" onClick={() => setMobileOpen(false)}>Waitlist</MobileLink>
            </>
          )}
          {user?.role === "admin" && (
            <MobileLink to="/admin" onClick={() => setMobileOpen(false)}>Admin Panel</MobileLink>
          )}
          {(user?.role === "organiser" || user?.role === "admin") && (
            <MobileLink to="/my-events" onClick={() => setMobileOpen(false)}>My Events</MobileLink>
          )}
          {createItems.length > 0 && createItems.map((item, i) => !item.separator && (
            <MobileLink key={i} to={item.to} onClick={() => setMobileOpen(false)}>{item.label}</MobileLink>
          ))}
        </div>
      )}
    </nav>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground transition-colors">
      {children}
    </Link>
  );
}
