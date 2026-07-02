import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

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

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Ticket Booking System</h1>
        <p className="text-muted-foreground max-w-md mx-auto">Book seats for movies and concerts with live seat maps, real-time availability, and instant QR tickets.</p>
      </div>
      <div className="flex gap-3">
        <Link to="/events"><Button size="lg">Browse Events</Button></Link>
        <Link to="/login"><Button variant="outline" size="lg">Login</Button></Link>
      </div>
    </div>
  );
}
