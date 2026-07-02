import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

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

  function handleFilter() { loadEvents(); }

  return (
    <div>
      <h1>Events</h1>

      <div className="filters">
        <input
          placeholder="Search events..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />
        <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
          <option value="">All types</option>
          <option value="movie">Movie</option>
          <option value="concert">Concert</option>
        </select>
        <button onClick={handleFilter}>Filter</button>
      </div>

      <div className="event-grid">
        {events.map((ev) => (
          <div key={ev.id} className="event-card">
            <div className="event-card-body">
              <h3>{ev.title}</h3>
              <p className="event-type">{ev.type}</p>
              <p className="event-venue">{ev.venue?.name}</p>
              <p className="event-date">{new Date(ev.date).toLocaleDateString()} at {new Date(ev.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
              <p className="event-duration">{ev.duration} min</p>
              {ev.eventPricings?.length > 0 && (
                <div className="event-pricing">
                  {ev.eventPricings.map((ep) => (
                    <span key={ep.id} className="price-tag">
                      {ep.category?.name}: ₹{Number(ep.price).toFixed(2)}
                    </span>
                  ))}
                </div>
              )}
              <Link to={`/events/${ev.id}`} className="btn-primary">View Seats</Link>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="no-events">No events found</p>}
      </div>
    </div>
  );
}
