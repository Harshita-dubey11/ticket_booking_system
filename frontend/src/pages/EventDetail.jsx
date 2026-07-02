import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import SeatMap from "../components/SeatMap";

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
    setError("");
    setMessage("");
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
    setError("");
    setMessage("");
    try {
      await api.delete("/holds", { eventId: id, showSeatIds: selectedSeats });
      setHeldUntil(null);
      setSelectedSeats([]);
      setMessage("Seats released.");
    } catch (err) {
      setError(err.message);
    }
  }

  if (!data) return <p>Loading...</p>;

  const { event, venue, categories, seatGrid } = data;

  return (
    <div className="event-detail">
      <h1>{event.title}</h1>
      <p className="event-meta">
        {event.type} at {venue.name} — {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — {event.duration}min
      </p>

      <SeatMap
        seatGrid={seatGrid}
        categories={categories}
        eventId={event.id}
        selectedSeats={selectedSeats}
        onToggleSeat={toggleSeat}
        heldByMe={user?.id}
      />

      <div className="seat-actions">
        <p className="selection-info">
          Selected: {selectedSeats.length > 0 ? selectedSeats.length : "None"}
          {heldUntil && <span className="held-timer"> (held until {new Date(heldUntil).toLocaleTimeString()})</span>}
        </p>

        {error && <p className="error">{error}</p>}
        {message && <p className="message">{message}</p>}

        <div className="action-buttons">
          {selectedSeats.length > 0 && !heldUntil && (
            <button className="btn-primary" onClick={handleHold}>Hold Seats</button>
          )}
          {heldUntil && (
            <button className="btn-primary">Proceed to Booking</button>
          )}
          {heldUntil && (
            <button className="btn-secondary" onClick={handleRelease}>Release Seats</button>
          )}
        </div>
      </div>
    </div>
  );
}
