import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/bookings").then(setBookings).catch(() => {});
  }, []);

  async function handleCancel(bookingId) {
    if (!confirm("Cancel this booking?")) return;
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      setMessage("Booking cancelled");
      const data = await api.get("/bookings");
      setBookings(data);
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div>
      <h1>My Bookings</h1>
      {message && <p className="message">{message}</p>}
      {bookings.length === 0 && <p>No bookings yet.</p>}
      <div className="booking-list">
        {bookings.map((b) => (
          <div key={b.id} className={`booking-card ${b.status}`}>
            <div className="booking-card-body">
              <h3>{b.event?.title}</h3>
              <p className="booking-meta">
                {b.event?.type} at {b.event?.venue?.name} — {new Date(b.event?.date).toLocaleDateString()}
              </p>
              <p className="booking-seats">
                Seats: {b.showSeats?.map((s) => s.seat?.label).join(", ")}
              </p>
              <p className="booking-ref">Ref: {b.reference} — ₹{Number(b.totalAmount).toFixed(2)}</p>
              <span className={`booking-status status-${b.status}`}>{b.status}</span>
              {b.status === "confirmed" && (
                <button className="btn-small btn-danger" onClick={() => handleCancel(b.id)} style={{ marginLeft: "1rem" }}>
                  Cancel
                </button>
              )}
              {b.qrCode && (
                <details className="qr-details">
                  <summary>Show QR Code</summary>
                  <img src={`data:image/png;base64,${b.qrCode}`} alt="QR" className="qr-image" />
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
