import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

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
    setLoading(true); setError("");
    try {
      const result = await api.post("/bookings", { eventId: id, showSeatIds: heldSeats.map((s) => s.id) });
      setBooking(result);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (booking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="text-4xl mb-2">✅</div>
            <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-left">
            <p><strong>Reference:</strong> {booking.reference}</p>
            <p><strong>Total:</strong> ₹{Number(booking.totalAmount).toFixed(2)}</p>
            <p><strong>Seats:</strong> {booking.seats.map((s) => s.label).join(", ")}</p>
            <p className="text-sm text-muted-foreground">A confirmation email with your QR code has been sent.</p>
            <Link to="/bookings"><Button className="w-full mt-3">View My Bookings</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Complete Booking</h1>
      <Card>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>{event.venue?.name} · {new Date(event.date).toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Held Seats ({heldSeats.length})</h4>
            <ul className="space-y-1">
              {heldSeats.map((s) => (
                <li key={s.id} className="text-sm flex justify-between py-1.5 border-b border-border last:border-0">
                  <span>{s.seat?.label}</span>
                  <span className="text-muted-foreground">{s.seat?.category?.name}</span>
                </li>
              ))}
            </ul>
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}
          <Button className="w-full" onClick={handleBook} disabled={loading}>{loading ? "Processing..." : "Confirm Booking"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
