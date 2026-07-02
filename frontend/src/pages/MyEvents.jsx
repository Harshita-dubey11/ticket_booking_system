import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/events/my").then(setEvents).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
          <p className="text-muted-foreground mt-1">Events you've created — manage pricing and view revenue</p>
        </div>
        <Link to="/organiser"><Button variant="outline" size="sm">Create Event</Button></Link>
      </div>

      {error && <div className="px-4 py-3 rounded-lg text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">{error}</div>}

      {events.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          <p className="text-muted-foreground">No events yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Create your first event to get started.</p>
          <Link to="/organiser"><Button className="mt-4">Create Event</Button></Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((ev) => (
            <Card key={ev.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-lg">{ev.title}</h3>
                  <Badge variant="outline" className="capitalize shrink-0">{ev.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{ev.venue?.name} · {new Date(ev.date).toLocaleDateString()} · {ev.duration}min</p>
                <div className="flex flex-wrap gap-1.5">
                  {ev.eventPricings?.map((ep) => (
                    <Badge key={ep.id} variant="secondary" className="text-xs" style={{ borderLeftColor: ep.category?.color, borderLeftWidth: 3 }}>
                      {ep.category?.name}: ₹{Number(ep.price).toFixed(2)}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{ev._count?.bookings || 0} bookings</span>
                  <span>·</span>
                  <span>{ev._count?.waitlist || 0} on waitlist</span>
                </div>
                <Link to={`/events/${ev.id}`}><Button variant="outline" size="sm" className="w-full">View Seats</Button></Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
