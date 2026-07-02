import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

export default function EventBrowse() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState({ type: "", search: "" });

  async function loadEvents() {
    const params = new URLSearchParams();
    if (filter.type) params.set("type", filter.type);
    if (filter.search) params.set("search", filter.search);
    const data = await api.get(`/events?${params}`);
    setEvents(data);
  }

  useEffect(() => { loadEvents(); }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground mt-1">Browse movies, concerts, and more — pick your seats</p>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Search</label>
          <Input placeholder="Search events..." value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} className="min-w-[200px]" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Type</label>
          <select className="flex h-9 w-[140px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
            <option value="">All types</option>
            <option value="movie">Movie</option>
            <option value="concert">Concert</option>
          </select>
        </div>
        <Button onClick={loadEvents}>Apply Filters</Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((ev) => (
          <Card key={ev.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
            <div className="h-2" style={{ background: ev.type === "movie" ? "linear-gradient(90deg, #6366f1, #8b5cf6)" : "linear-gradient(90deg, #f59e0b, #ef4444)" }} />
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-lg leading-tight">{ev.title}</h3>
                <Badge variant="outline" className="capitalize shrink-0">{ev.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {ev.venue?.name}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {new Date(ev.date).toLocaleDateString()} {new Date(ev.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {ev.duration}min
              </p>
              {ev.eventPricings?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ev.eventPricings.map((ep) => (
                    <Badge key={ep.id} variant="secondary" className="text-xs">
                      {ep.category?.name}: ₹{Number(ep.price).toFixed(2)}
                    </Badge>
                  ))}
                </div>
              )}
              <Link to={`/events/${ev.id}`}>
                <Button className="w-full mt-1">View Seats</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 && (
          <div className="col-span-full text-center py-16">
            <svg className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            <p className="text-muted-foreground">No events found</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
