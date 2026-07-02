import { useState, useEffect } from "react";
import { api } from "../services/api";

export default function OrganiserDashboard() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", type: "movie", venueId: "", date: "", duration: 120 });
  const [pricing, setPricing] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [message, setMessage] = useState("");

  async function loadEvents() {
    const data = await api.get("/events/my");
    setEvents(data);
  }

  async function loadVenues() {
    try {
      const data = await api.get("/admin/venues");
      setVenues(data);
    } catch {
      setVenues([]);
    }
  }

  useEffect(() => {
    loadEvents();
    loadVenues();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setMessage("");
    const data = await api.post("/events", form);
    setMessage("Event created");
    setForm({ title: "", description: "", type: "movie", venueId: "", date: "", duration: 120 });
    await loadEvents();
    if (data.id) handleSelectEvent(data.id);
  }

  async function handleSelectEvent(id) {
    const data = await api.get(`/events/${id}`);
    setSelectedEvent(data);
    setPricing(
      (data.eventPricings || []).map((ep) => ({ categoryId: ep.category.id, price: Number(ep.price) }))
    );
  }

  async function handleSavePricing() {
    if (!selectedEvent) return;
    setMessage("");
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
    <div className="dashboard">
      <h1>Organiser Dashboard</h1>

      <div className="dashboard-layout">
        <div className="dashboard-panel">
          <h2>My Events</h2>
          <form onSubmit={handleCreate} className="inline-form">
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="movie">Movie</option>
              <option value="concert">Concert</option>
            </select>
            <select value={form.venueId} onChange={(e) => setForm({ ...form, venueId: e.target.value })} required>
              <option value="">Select venue</option>
              {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            <input type="number" placeholder="Duration (min)" value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} min={1} />
            <button type="submit">Create Event</button>
          </form>

          <ul className="item-list">
            {events.map((ev) => (
              <li key={ev.id} className={selectedEvent?.id === ev.id ? "active" : ""}>
                <span onClick={() => handleSelectEvent(ev.id)}>
                  {ev.title} — {ev.type} — {new Date(ev.date).toLocaleDateString()}
                </span>
                <button className="btn-small btn-danger" onClick={() => handleDeleteEvent(ev.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {selectedEvent && (
          <div className="dashboard-panel">
            <h2>{selectedEvent.title}</h2>
            <p>Venue: {selectedEvent.venue?.name} | {new Date(selectedEvent.date).toLocaleString()} | {selectedEvent.duration}min</p>

            <h3>Per-Category Pricing</h3>
            <div className="pricing-list">
              {venueCategories.map((cat) => {
                const entry = pricing.find((p) => p.categoryId === cat.id);
                return (
                  <div key={cat.id} className="pricing-row">
                    <span style={{ color: cat.color }}>■</span> {cat.name}
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={entry?.price || ""}
                      onChange={(e) => {
                        const val = e.target.value ? parseFloat(e.target.value) : 0;
                        setPricing((prev) => {
                          const next = prev.filter((p) => p.categoryId !== cat.id);
                          return [...next, { categoryId: cat.id, price: val }];
                        });
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <button onClick={handleSavePricing} className="btn-primary">Save Pricing</button>

            {message && <p className="message">{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
