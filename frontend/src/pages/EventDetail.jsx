import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import SeatMap from "../components/SeatMap";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [heldUntil, setHeldUntil] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/events/${id}/seats`).then(setData).catch(() => navigate("/events"));
  }, [id, navigate]);

  function toggleSeat(seatId) {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId],
    );
  }

  async function handleHold() {
    if (!user) { navigate("/login"); return; }
    setError(""); setMessage("");
    try {
      const res = await api.post("/holds", { eventId: id, showSeatIds: selectedSeats });
      setHeldUntil(res.heldUntil);
      setMessage("Seats held! Complete booking within the time limit.");
    } catch (err) {
      setError(err.message);
      setSelectedSeats([]);
    }
  }

  async function handleRelease() {
    setError(""); setMessage("");
    try {
      await api.delete("/holds", { eventId: id, showSeatIds: selectedSeats });
      setHeldUntil(null);
      setSelectedSeats([]);
      setMessage("Seats released.");
    } catch (err) { setError(err.message); }
  }

  async function handleJoinWaitlist(categoryId) {
    if (!user) { navigate("/login"); return; }
    setError(""); setMessage("");
    try {
      await api.post(`/events/${id}/waitlist`, { categoryId });
      setMessage("You've joined the waitlist for this category.");
    } catch (err) { setError(err.message); }
  }

  if (!data) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  const { event, venue, categories, seatGrid } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-muted-foreground">
            <Badge variant="outline" className="capitalize">{event.type}</Badge>
            <span className="text-sm">{venue.name}</span>
            <span className="text-xs text-muted-foreground/50" aria-hidden="true">·</span>
            <span className="text-sm">{new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            <span className="text-xs text-muted-foreground/50" aria-hidden="true">·</span>
            <span className="text-sm">{event.duration}min</span>
          </div>
        </div>
      </div>

      <SeatMap seatGrid={seatGrid} categories={categories} eventId={event.id} selectedSeats={selectedSeats} onToggleSeat={toggleSeat} heldByMe={user?.id} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Booking</CardTitle>
          <CardDescription>
            {selectedSeats.length > 0
              ? `${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""} selected`
              : "Click on an available seat above to select it"}
            {heldUntil && (
              <span className="text-orange-600 ml-2 font-medium">
                (held until {new Date(heldUntil).toLocaleTimeString()})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">{error}</div>}
          {message && <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md border border-green-200">{message}</div>}

          <div className="flex flex-wrap gap-3">
            {selectedSeats.length > 0 && !heldUntil && <Button onClick={handleHold}>Hold Seats</Button>}
            {heldUntil && <Link to={`/checkout/${event.id}`}><Button>Proceed to Booking</Button></Link>}
            {heldUntil && <Button variant="outline" onClick={handleRelease}>Release Seats</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Waitlist</CardTitle>
          <CardDescription>Sold out? Join the waitlist and get notified when seats open up</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button key={cat.id} variant="outline" size="sm" onClick={() => handleJoinWaitlist(cat.id)}>
                {cat.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
