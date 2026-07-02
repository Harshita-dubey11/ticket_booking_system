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
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get(`/events/${id}`).then(setEvent).catch((err) => setPageError(err.message)),
      api.get("/holds").then(setHeldSeats).catch((err) => setPageError(err.message)),
    ]);
  }, [id]);

  async function handleBook() {
    setLoading(true); setError("");
    try {
      const result = await api.post("/bookings", { eventId: id, showSeatIds: heldSeats.map((s) => s.id) });
      setBooking(result);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (pageError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            </div>
            <p className="text-destructive text-sm">{pageError}</p>
            <Button variant="outline" onClick={() => navigate("/events")}>Browse Events</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (booking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-left">
            <div className="bg-muted/40 rounded-lg p-4 space-y-2 text-sm">
              <p className="flex justify-between"><span className="text-muted-foreground">Reference</span><span className="font-medium">{booking.reference}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium">₹{Number(booking.totalAmount).toFixed(2)}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Seats</span><span className="font-medium">{booking.seats.map((s) => s.label).join(", ")}</span></p>
            </div>
            <p className="text-xs text-muted-foreground">A confirmation email with your QR code has been sent.</p>
            <Link to="/bookings"><Button className="w-full">View My Bookings</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-lg mx-auto space-y-6 py-6">
      <h1 className="text-2xl font-bold">Complete Booking</h1>
      <Card>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>{event.venue?.name} · {new Date(event.date).toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Held Seats ({heldSeats.length})</h4>
            {heldSeats.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No seats held. Go back to the event page to select seats.</p>
            ) : (
              <ul className="space-y-1">
                {heldSeats.map((s) => (
                  <li key={s.id} className="text-sm flex justify-between py-1.5 border-b border-border last:border-0">
                    <span>{s.seat?.label}</span>
                    <span className="text-muted-foreground">{s.seat?.category?.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">{error}</div>}
          {heldSeats.length > 0 && (
            <Button className="w-full" onClick={handleBook} disabled={loading}>
              {loading ? <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> Processing...</span> : "Confirm Booking"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
