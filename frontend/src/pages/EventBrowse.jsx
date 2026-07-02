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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
      </div>

      <div className="flex gap-3">
        <Input placeholder="Search events..." value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} className="max-w-xs" />
        <select className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
          <option value="">All types</option>
          <option value="movie">Movie</option>
          <option value="concert">Concert</option>
        </select>
        <Button onClick={loadEvents}>Filter</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((ev) => (
          <Card key={ev.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg leading-tight">{ev.title}</h3>
                <Badge variant="outline" className="capitalize">{ev.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{ev.venue?.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(ev.date).toLocaleDateString()} {new Date(ev.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {ev.duration}min
              </p>
              {ev.eventPricings?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {ev.eventPricings.map((ep) => (
                    <Badge key={ep.id} variant="secondary" className="text-xs">
                      {ep.category?.name}: ₹{Number(ep.price).toFixed(2)}
                    </Badge>
                  ))}
                </div>
              )}
              <Link to={`/events/${ev.id}`}><Button className="w-full mt-2">View Seats</Button></Link>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">No events found</p>}
      </div>
    </div>
  );
}
