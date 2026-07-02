import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";

export default function OrganiserDashboard() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [tab, setTab] = useState("list");
  const [form, setForm] = useState({ title: "", description: "", type: "movie", venueId: "", date: "", duration: 120 });
  const [pricing, setPricing] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [revenue, setRevenue] = useState(null);

  async function loadEvents() { setEvents(await api.get("/events/my")); }
  async function loadVenues() { try { setVenues(await api.get("/admin/venues")); } catch { setVenues([]); } }

  useEffect(() => { loadEvents(); loadVenues(); }, []);

  function showMsg(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  }

  async function handleCreate(e) {
    e.preventDefault(); setMessage({ text: "", type: "" });
    try {
      const data = await api.post("/events", form);
      showMsg("Event created successfully");
      setForm({ title: "", description: "", type: "movie", venueId: "", date: "", duration: 120 });
      await loadEvents();
      if (data.id) { handleSelectEvent(data.id); setTab("manage"); }
    } catch (err) { showMsg(err.message, "error"); }
  }

  async function handleSelectEvent(id) {
    const data = await api.get(`/events/${id}`);
    setSelectedEvent(data);
    setPricing((data.eventPricings || []).map((ep) => ({ categoryId: ep.category.id, price: Number(ep.price) })));
    try { setRevenue(await api.get(`/events/${id}/revenue`)); } catch { setRevenue(null); }
    setTab("manage");
  }

  async function handleSavePricing() {
    if (!selectedEvent) return; setMessage({ text: "", type: "" });
    try {
      await api.put(`/events/${selectedEvent.id}/pricing`, { prices: pricing });
      showMsg("Pricing saved");
      handleSelectEvent(selectedEvent.id);
    } catch (err) { showMsg(err.message, "error"); }
  }

  async function handleDeleteEvent(id) {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      await api.delete(`/events/${id}`);
      showMsg("Event deleted");
      setSelectedEvent(null);
      setTab("list");
      await loadEvents();
    } catch (err) { showMsg(err.message, "error"); }
  }

  function setPricingFor(categoryId, price) {
    setPricing((prev) => [...prev.filter((p) => p.categoryId !== categoryId), { categoryId, price }]);
  }

  const venueCategories = selectedEvent?.venue?.seatCategories || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organiser Dashboard</h1>
          <p className="text-muted-foreground mt-1">Create and manage your events</p>
        </div>
        <Button onClick={() => { setTab("list"); setSelectedEvent(null); }} variant={tab === "list" ? "default" : "outline"} size="sm">My Events</Button>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === "error" ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {message.text}
        </div>
      )}

      {tab === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
            <CardDescription>Fill in the details to add a new movie or concert event</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium">Event Title</label>
                <Input placeholder="e.g. Avengers: Endgame" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Brief description of the event" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="movie">Movie</option>
                  <option value="concert">Concert</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Venue</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" value={form.venueId} onChange={(e) => setForm({ ...form, venueId: e.target.value })} required>
                  <option value="">Select a venue</option>
                  {venues.map((v) => <option key={v.id} value={v.id}>{v.name} ({v._count.seats} seats)</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date & Time</label>
                <Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input type="number" placeholder="120" value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} min={1} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 pt-2">
                <Button type="submit" className="w-full sm:w-auto">Create Event</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {tab === "list" && events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Events ({events.length})</CardTitle>
            <CardDescription>Click on an event to manage pricing and view revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border rounded-lg border">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => handleSelectEvent(ev.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{ev.title}</span>
                      <Badge variant="outline" className="capitalize shrink-0 text-xs">{ev.type}</Badge>
                      <Badge variant="secondary" className="shrink-0 text-xs">{ev._count?.bookings || 0} bookings</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {ev.venue?.name} · {new Date(ev.date).toLocaleDateString()} · {ev.duration}min
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleSelectEvent(ev.id); }}>Manage</Button>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }}>Delete</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "manage" && selectedEvent && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedEvent.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {selectedEvent.venue?.name} · {new Date(selectedEvent.date).toLocaleDateString()} · {new Date(selectedEvent.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {selectedEvent.duration}min
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="capitalize">{selectedEvent.type}</Badge>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-5 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                    Per-Category Pricing
                  </h4>
                  <div className="space-y-2.5">
                    {venueCategories.map((cat) => {
                      const entry = pricing.find((p) => p.categoryId === cat.id);
                      return (
                        <div key={cat.id} className="flex items-center gap-3 p-2.5 rounded-lg border bg-card">
                          <span className="w-4 h-4 rounded shrink-0 ring-1 ring-black/5" style={{ background: cat.color }} />
                          <span className="text-sm font-medium w-20">{cat.name}</span>
                          <div className="relative flex-1 max-w-[140px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                            <Input
                              type="number" step="0.01" placeholder="0.00"
                              value={entry?.price ?? ""}
                              onChange={(e) => setPricingFor(cat.id, e.target.value ? parseFloat(e.target.value) : 0)}
                              className="pl-6 h-8 text-sm"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button onClick={handleSavePricing} size="sm" className="mt-4">Save Pricing</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {revenue && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Revenue Overview
                  </CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                      <p className="text-2xl font-bold text-green-700">₹{Number(revenue.totalRevenue).toFixed(2)}</p>
                      <p className="text-xs text-green-600 mt-1">Total Revenue</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                      <p className="text-2xl font-bold text-blue-700">{revenue.bookingCount}</p>
                      <p className="text-xs text-blue-600 mt-1">Confirmed Bookings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {revenue?.bookings?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent Bookings</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {revenue.bookings.slice(0, 10).map((b) => (
                      <div key={b.id} className="flex justify-between items-center text-sm py-1.5 border-b border-border last:border-0">
                        <span className="truncate max-w-[200px]">{b.user?.name}</span>
                        <span className="text-muted-foreground shrink-0">₹{Number(b.totalAmount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button variant="outline" onClick={() => { setTab("list"); setSelectedEvent(null); }} className="w-full">← Back to Events</Button>
          </div>
        </div>
      )}
    </div>
  );
}
