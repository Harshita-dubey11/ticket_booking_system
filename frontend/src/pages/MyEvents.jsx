import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/events/my")
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
        <p className="text-muted-foreground mt-1">Manage your events — set pricing, view revenue, and track performance</p>
      </div>

      {error && <div className="px-4 py-3 rounded-lg text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">{error}</div>}

      {events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border/60 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </div>
          <p className="text-muted-foreground font-medium">No events yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Create your first event to get started.</p>
          <Link to="/organiser"><Button className="mt-5 gradient-primary text-white shadow-md shadow-indigo-500/20">Create Event</Button></Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {events.map((ev) => (
            <ManageEventCard key={ev.id} event={ev} />
          ))}
        </div>
      )}
    </div>
  );
}

function ManageEventCard({ event: ev }) {
  const [revenue, setRevenue] = useState(null);
  const [pricingData, setPricingData] = useState(null);
  const [pricingForm, setPricingForm] = useState({});
  const [message, setMessage] = useState("");
  const [showPricing, setShowPricing] = useState(false);
  const [showRevenue, setShowRevenue] = useState(false);

  async function loadPricing() {
    try {
      const data = await api.get(`/events/${ev.id}`);
      setPricingData(data.eventPricings || []);
      const map = {};
      for (const p of data.eventPricings || []) {
        map[p.categoryId] = Number(p.price);
      }
      setPricingForm(map);
    } catch {}
  }

  async function loadRevenue() {
    try {
      setRevenue(await api.get(`/events/${ev.id}/revenue`));
    } catch {}
  }

  function togglePricing() {
    if (!showPricing) loadPricing();
    setShowPricing(!showPricing);
    setShowRevenue(false);
  }

  function toggleRevenue() {
    if (!showRevenue) loadRevenue();
    setShowRevenue(!showRevenue);
    setShowPricing(false);
  }

  async function savePricing() {
    const prices = Object.entries(pricingForm).map(([categoryId, price]) => ({ categoryId, price: Number(price) }));
    try {
      await api.put(`/events/${ev.id}/pricing`, { prices });
      setMessage("Pricing saved");
      setTimeout(() => setMessage(""), 2500);
    } catch (err) { setMessage(err.message); }
  }

  const seatCategories = ev.eventPricings?.map((ep) => ep.category).filter(Boolean) || [];

  return (
    <Card className="overflow-hidden border-0 shadow-md card-hover">
      <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-600" />
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg leading-tight">{ev.title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{ev.venue?.name} · {new Date(ev.date).toLocaleDateString()}</p>
          </div>
          <Badge variant="outline" className="capitalize shrink-0">{ev.type}</Badge>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(ev.eventPricings || []).map((ep) => (
            <Badge key={ep.id} variant="secondary" className="text-xs" style={{ borderLeftColor: ep.category?.color, borderLeftWidth: 3 }}>
              {ep.category?.name}: ₹{Number(ep.price).toFixed(2)}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            {ev._count?.bookings || 0} booked
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            {ev._count?.waitlist || 0} waitlisted
          </span>
          <span>{ev.duration}min</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Link to={`/events/${ev.id}`}><Button variant="outline" size="sm">View Seats</Button></Link>
          <Button variant="outline" size="sm" onClick={togglePricing}>{showPricing ? "Hide Pricing" : "Set Pricing"}</Button>
          <Button variant="outline" size="sm" onClick={toggleRevenue}>{showRevenue ? "Hide Revenue" : "Revenue"}</Button>
        </div>

        {message && <p className="text-xs text-green-700 bg-green-50 p-2 rounded-md">{message}</p>}

        {showPricing && (
          <div className="bg-muted/50 rounded-xl p-4 space-y-3 border border-border/50">
            <h4 className="text-sm font-semibold">Per-Category Pricing</h4>
            {ev.eventPricings?.length > 0 ? (
              ev.eventPricings.map((ep) => (
                <div key={ep.id} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: ep.category?.color }} />
                  <span className="text-sm flex-1">{ep.category?.name}</span>
                  <span className="text-xs text-muted-foreground">₹</span>
                  <input
                    type="number" step="0.01" min="0"
                    className="w-24 h-8 rounded-md border border-input bg-white px-2 text-sm text-right"
                    value={pricingForm[ep.categoryId] ?? Number(ep.price)}
                    onChange={(e) => setPricingForm({ ...pricingForm, [ep.categoryId]: e.target.value })}
                  />
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No categories with pricing. Add categories in the venue first.</p>
            )}
            {ev.eventPricings?.length > 0 && (
              <Button size="sm" className="w-full" onClick={savePricing}>Save Pricing</Button>
            )}
          </div>
        )}

        {showRevenue && (
          <div className="bg-muted/50 rounded-xl p-4 space-y-3 border border-border/50">
            <h4 className="text-sm font-semibold">Revenue Overview</h4>
            {revenue ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center border border-border/50">
                    <p className="text-2xl font-bold text-emerald-600">₹{Number(revenue.totalRevenue).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-border/50">
                    <p className="text-2xl font-bold text-indigo-600">{revenue.bookingCount}</p>
                    <p className="text-xs text-muted-foreground">Bookings</p>
                  </div>
                </div>
                {revenue.bookings?.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {revenue.bookings.map((b) => (
                      <div key={b.id} className="flex justify-between items-center text-xs bg-white rounded-md px-3 py-2 border border-border/50">
                        <span className="text-muted-foreground">{b.user?.name}</span>
                        <span className="font-medium">₹{Number(b.totalAmount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-2 text-center">Loading...</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
