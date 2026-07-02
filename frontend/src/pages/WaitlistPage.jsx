import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function WaitlistPage() {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/waitlist").then(setEntries).catch((err) => setError(err.message));
  }, []);

  async function handleLeave(id) {
    if (!confirm("Leave the waitlist?")) return;
    try {
      await api.delete(`/waitlist/${id}`);
      setMessage("Removed from waitlist");
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) { setError(err.message); }
  }

  const statusConfig = {
    waiting: { variant: "secondary", label: "Waiting" },
    offered: { variant: "default", label: "Offer Available" },
    expired: { variant: "outline", label: "Expired" },
    booked: { variant: "default", label: "Booked" },
    cancelled: { variant: "outline", label: "Cancelled" },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Waitlist</h1>
        <p className="text-muted-foreground mt-1">Track your waitlist entries across events</p>
      </div>

      {error && <div className="px-4 py-3 rounded-lg text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">{error}</div>}
      {message && <div className="px-4 py-3 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200">{message}</div>}

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          <p className="text-muted-foreground">No waitlist entries yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Join a waitlist from any event page when seats are sold out.</p>
          <Link to="/events"><Button className="mt-4">Browse Events</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => {
            const cfg = statusConfig[e.status] || { variant: "outline", label: e.status };
            return (
              <Card key={e.id}>
                <div className="flex items-stretch">
                  <div className={`w-1 shrink-0 rounded-l-lg ${e.status === "offered" ? "bg-green-500" : e.status === "waiting" ? "bg-amber-400" : "bg-muted-foreground/30"}`} />
                  <CardContent className="flex-1 p-5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold">{e.event?.title}</h3>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{e.event?.venue?.name} · {new Date(e.event?.date).toLocaleDateString()}</p>
                    <p className="text-sm" style={{ color: e.category?.color }}>Category: {e.category?.name}</p>
                    <div className="flex items-center gap-2 pt-1">
                      {e.status === "offered" && (
                        <Link to={`/events/${e.eventId}`}><Button size="sm">Claim Seat</Button></Link>
                      )}
                      {e.status === "waiting" && (
                        <Button variant="destructive" size="sm" onClick={() => handleLeave(e.id)}>Leave</Button>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
