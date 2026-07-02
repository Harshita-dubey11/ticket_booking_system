import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

export default function OrganiserDashboard() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", type: "movie", venueId: "", date: "", duration: 120 });
  const [pricing, setPricing] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [message, setMessage] = useState("");
  const [revenue, setRevenue] = useState(null);

  async function loadEvents() { setEvents(await api.get("/events/my")); }
  async function loadVenues() { try { setVenues(await api.get("/admin/venues")); } catch { setVenues([]); } }

  useEffect(() => { loadEvents(); loadVenues(); }, []);

  async function handleCreate(e) {
    e.preventDefault(); setMessage("");
    const data = await api.post("/events", form);
    setMessage("Event created");
    setForm({ title: "", description: "", type: "movie", venueId: "", date: "", duration: 120 });
    await loadEvents();
    if (data.id) handleSelectEvent(data.id);
  }

  async function handleSelectEvent(id) {
    const data = await api.get(`/events/${id}`);
    setSelectedEvent(data);
    setPricing((data.eventPricings || []).map((ep) => ({ categoryId: ep.category.id, price: Number(ep.price) })));
    try { setRevenue(await api.get(`/events/${id}/revenue`)); } catch { setRevenue(null); }
  }

  async function handleSavePricing() {
    if (!selectedEvent) return; setMessage("");
    await api.put(`/events/${selectedEvent.id}/pricing`, { prices: pricing });
    setMessage("Pricing saved");
    handleSelectEvent(selectedEvent.id);
  }

  async function handleDeleteEvent(id) {
    if (!confirm("Delete this event?")) return;
    await api.delete(`/events/${id}`);
    setSelectedEvent(null);
    await loadEvents();
  }

  const venueCategories = selectedEvent?.venue?.seatCategories || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Organiser Dashboard</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>My Events</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="flex-1" />
              <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="flex-1" />
              <select className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="movie">Movie</option>
                <option value="concert">Concert</option>
              </select>
              <select className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={form.venueId} onChange={(e) => setForm({ ...form, venueId: e.target.value })} required>
                <option value="">Venue</option>
                {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="w-36" />
              <Input type="number" placeholder="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} min={1} className="w-24" />
              <Button type="submit" size="sm">Create</Button>
            </form>

            <div className="item-list">
              {events.map((ev) => (
                <div key={ev.id} className={`flex justify-between items-center px-3 py-2.5 border-b border-border cursor-pointer text-sm transition-colors hover:bg-muted ${selectedEvent?.id === ev.id ? "bg-primary/10 font-semibold" : ""}`}>
                  <span onClick={() => handleSelectEvent(ev.id)} className="flex-1">
                    {ev.title} <Badge variant="outline" className="ml-2 text-xs capitalize">{ev.type}</Badge>
                    <span className="text-muted-foreground font-normal ml-2">{new Date(ev.date).toLocaleDateString()}</span>
                  </span>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(ev.id)}>Delete</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedEvent && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{selectedEvent.title}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{selectedEvent.venue?.name} · {new Date(selectedEvent.date).toLocaleString()} · {selectedEvent.duration}min</p>

                <h4 className="text-sm font-semibold">Per-Category Pricing</h4>
                <div className="space-y-2">
                  {venueCategories.map((cat) => {
                    const entry = pricing.find((p) => p.categoryId === cat.id);
                    return (
                      <div key={cat.id} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-sm inline-block shrink-0" style={{ background: cat.color }} />
                        <span className="w-24">{cat.name}</span>
                        <Input type="number" step="0.01" placeholder="Price" value={entry?.price || ""} onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : 0;
                          setPricing((prev) => [...prev.filter((p) => p.categoryId !== cat.id), { categoryId: cat.id, price: val }]);
                        }} className="w-24 ml-auto" />
                      </div>
                    );
                  })}
                </div>
                <Button onClick={handleSavePricing} variant="outline" size="sm">Save Pricing</Button>
              </CardContent>
            </Card>

            {revenue && (
              <Card>
                <CardHeader><CardTitle>Revenue</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>Total Revenue: <strong>₹{Number(revenue.totalRevenue).toFixed(2)}</strong></p>
                  <p>Confirmed Bookings: <strong>{revenue.bookingCount}</strong></p>
                </CardContent>
              </Card>
            )}

            {message && <p className="text-sm text-green-700 bg-green-50 p-3 rounded-md">{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
