import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function WaitlistPage() {
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/waitlist").then(setEntries).catch(() => {});
  }, []);

  async function handleLeave(id) {
    if (!confirm("Leave the waitlist?")) return;
    try {
      await api.delete(`/waitlist/${id}`);
      setMessage("Removed from waitlist");
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div>
      <h1>My Waitlist</h1>
      {message && <p className="message">{message}</p>}
      {entries.length === 0 && <p>You are not on any waitlists.</p>}
      <div className="waitlist-list">
        {entries.map((e) => (
          <div key={e.id} className={`waitlist-card status-${e.status}`}>
            <div className="waitlist-card-body">
              <h3>{e.event?.title}</h3>
              <p className="waitlist-meta">
                {e.event?.venue?.name} — {new Date(e.event?.date).toLocaleDateString()}
              </p>
              <p className="waitlist-category" style={{ color: e.category?.color }}>
                Category: {e.category?.name}
              </p>
              <span className={`booking-status status-${e.status}`}>{e.status}</span>
              {e.status === "waiting" && (
                <button className="btn-small btn-danger" onClick={() => handleLeave(e.id)} style={{ marginLeft: "1rem" }}>
                  Leave
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
