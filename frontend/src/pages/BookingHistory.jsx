import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
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

  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground mt-1">View your confirmed bookings and past cancellations</p>
      </div>

      {message && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200">
          {message}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
          <p className="text-muted-foreground">No bookings yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Browse events and book your first tickets.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {confirmed.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                Active Bookings ({confirmed.length})
              </h2>
              <div className="space-y-3">
                {confirmed.map((b) => (
                  <BookingCard key={b.id} booking={b} onCancel={handleCancel} />
                ))}
              </div>
            </section>
          )}

          {cancelled.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 inline-block" />
                Cancelled ({cancelled.length})
              </h2>
              <div className="space-y-3">
                {cancelled.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking: b, onCancel }) {
  const [showQr, setShowQr] = useState(false);
  const isConfirmed = b.status === "confirmed";

  return (
    <Card className={`overflow-hidden ${!isConfirmed ? "opacity-60" : ""}`}>
      <div className="flex items-stretch">
        <div className={`w-1 shrink-0 ${isConfirmed ? "bg-green-500" : "bg-red-400"}`} />
        <CardContent className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">{b.event?.title}</h3>
                <Badge variant={isConfirmed ? "default" : "secondary"} className="capitalize">{b.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {b.event?.type} at {b.event?.venue?.name} · {new Date(b.event?.date).toLocaleDateString()}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span><span className="text-muted-foreground">Seats:</span> {b.showSeats?.map((s) => s.seat?.label).join(", ")}</span>
                <span><span className="text-muted-foreground">Ref:</span> {b.reference}</span>
                <span className="font-medium">₹{Number(b.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                {isConfirmed && onCancel && (
                  <Button variant="destructive" size="sm" onClick={() => onCancel(b.id)}>Cancel Booking</Button>
                )}
                {b.qrCode && (
                  <Button variant="outline" size="sm" onClick={() => setShowQr(!showQr)}>
                    {showQr ? "Hide QR" : "Show QR"}
                  </Button>
                )}
              </div>
              {showQr && b.qrCode && (
                <div className="mt-3 p-3 bg-muted/30 rounded-lg inline-block">
                  <img src={`data:image/png;base64,${b.qrCode}`} alt="QR Code" className="w-28 h-28" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
