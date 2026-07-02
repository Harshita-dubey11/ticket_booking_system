import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import SeatMap from "../components/SeatMap";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

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
    api.get(`/events/${id}`).then(setData).catch(() => navigate("/events"));
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
        <p className="text-muted-foreground mt-1">
          <Badge variant="outline" className="mr-2 capitalize">{event.type}</Badge>
          {venue.name} · {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {event.duration}min
        </p>
      </div>

      <SeatMap seatGrid={seatGrid} categories={categories} eventId={event.id} selectedSeats={selectedSeats} onToggleSeat={toggleSeat} heldByMe={user?.id} />

      <div className="bg-card border rounded-xl p-5 space-y-3">
        <p className="text-sm">
          Selected: <strong>{selectedSeats.length > 0 ? `${selectedSeats.length} seats` : "None"}</strong>
          {heldUntil && <span className="text-orange-600 ml-2">(held until {new Date(heldUntil).toLocaleTimeString()})</span>}
        </p>

        {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}
        {message && <p className="text-sm text-green-700 bg-green-50 p-3 rounded-md">{message}</p>}

        <div className="flex gap-3">
          {selectedSeats.length > 0 && !heldUntil && <Button onClick={handleHold}>Hold Seats</Button>}
          {heldUntil && <Link to={`/checkout/${event.id}`}><Button>Proceed to Booking</Button></Link>}
          {heldUntil && <Button variant="outline" onClick={handleRelease}>Release Seats</Button>}
        </div>
      </div>

      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h3 className="font-semibold">Sold out? Join the waitlist</h3>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <Button key={cat.id} variant="outline" size="sm" onClick={() => handleJoinWaitlist(cat.id)}>{cat.name}</Button>
          ))}
        </div>
      </div>
    </div>
  );
}
