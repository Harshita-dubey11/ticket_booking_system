import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [heldSeats, setHeldSeats] = useState([]);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/events/${id}`).then(setEvent),
      api.get("/holds").then(setHeldSeats),
    ]).catch(() => navigate("/events"));
  }, [id, navigate]);

  async function handleBook() {
    setLoading(true);
    setError("");
    try {
      const seatIds = heldSeats.map((s) => s.id);
      const result = await api.post("/bookings", { eventId: id, showSeatIds: seatIds });
      setBooking(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (booking) {
    return (
      <div className="booking-confirmed">
        <h1>Booking Confirmed!</h1>
        <div className="confirmation-card">
          <p><strong>Reference:</strong> {booking.reference}</p>
          <p><strong>Total:</strong> ₹{Number(booking.totalAmount).toFixed(2)}</p>
          <p><strong>Seats:</strong> {booking.seats.map((s) => s.label).join(", ")}</p>
          <p className="email-note">A confirmation email with your QR code has been sent to your email.</p>
          <Link to="/bookings" className="btn-primary">View My Bookings</Link>
        </div>
      </div>
    );
  }

  if (!event) return <p>Loading...</p>;

  return (
    <div className="checkout">
      <h1>Complete Booking</h1>
      <div className="checkout-summary">
        <h2>{event.title}</h2>
        <p>{event.venue?.name} — {new Date(event.date).toLocaleDateString()}</p>

        <h3>Held Seats ({heldSeats.length})</h3>
        <ul className="held-seats-list">
          {heldSeats.map((s) => (
            <li key={s.id}>
              {s.seat?.label} — {s.seat?.category?.name}
            </li>
          ))}
        </ul>

        {error && <p className="error">{error}</p>}

        <button className="btn-primary" onClick={handleBook} disabled={loading}>
          {loading ? "Processing..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
