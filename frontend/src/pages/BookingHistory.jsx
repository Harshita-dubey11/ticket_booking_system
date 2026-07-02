import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => { api.get("/bookings").then(setBookings).catch(() => {}); }, []);

  async function handleCancel(bookingId) {
    if (!confirm("Cancel this booking?")) return;
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      setMessage("Booking cancelled");
      setBookings(await api.get("/bookings"));
    } catch (err) { setMessage(err.message); }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
      {message && <p className="text-sm text-green-700 bg-green-50 p-3 rounded-md">{message}</p>}
      {bookings.length === 0 && <p className="text-muted-foreground">No bookings yet.</p>}

      <div className="space-y-3">
        {bookings.map((b) => (
          <Card key={b.id} className={`overflow-hidden ${b.status === "cancelled" ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-1 p-5" style={{ borderLeft: `4px solid ${b.status === "confirmed" ? "#22c55e" : "#ef4444"}` }}>
              <div className="flex-1 space-y-1.5">
                <h3 className="font-semibold">{b.event?.title}</h3>
                <p className="text-sm text-muted-foreground">{b.event?.type} at {b.event?.venue?.name} · {new Date(b.event?.date).toLocaleDateString()}</p>
                <p className="text-sm">Seats: {b.showSeats?.map((s) => s.seat?.label).join(", ")}</p>
                <p className="text-sm text-muted-foreground">Ref: {b.reference} · ₹{Number(b.totalAmount).toFixed(2)}</p>
                <Badge variant={b.status === "confirmed" ? "default" : "secondary"}>{b.status}</Badge>
                {b.status === "confirmed" && (
                  <Button variant="destructive" size="sm" className="ml-2" onClick={() => handleCancel(b.id)}>Cancel</Button>
                )}
                {b.qrCode && (
                  <details className="mt-2">
                    <summary className="text-xs text-primary cursor-pointer">Show QR Code</summary>
                    <img src={`data:image/png;base64,${b.qrCode}`} alt="QR" className="mt-2 w-32 h-32" />
                  </details>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
