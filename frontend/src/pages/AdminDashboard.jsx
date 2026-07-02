import { useState, useEffect } from "react";
import { api } from "../services/api";

export default function AdminDashboard() {
  const [venues, setVenues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", rows: 10, columns: 12 });
  const [catForm, setCatForm] = useState({ name: "", color: "#FFD700", description: "" });
  const [message, setMessage] = useState("");

  async function loadVenues() {
    const data = await api.get("/admin/venues");
    setVenues(data);
  }

  useEffect(() => { loadVenues(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setMessage("");
    await api.post("/admin/venues", form);
    setForm({ name: "", address: "", rows: 10, columns: 12 });
    await loadVenues();
    setMessage("Venue created");
  }

  async function handleSelect(id) {
    const data = await api.get(`/admin/venues/${id}`);
    setSelected(data);
    setMessage("");
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    if (!selected) return;
    await api.post(`/admin/venues/${selected.id}/categories`, catForm);
    setCatForm({ name: "", color: "#FFD700", description: "" });
    handleSelect(selected.id);
  }

  async function handleGenerateSeats() {
    if (!selected) return;
    setMessage("");
    try {
      const res = await api.post(`/admin/venues/${selected.id}/generate-seats`);
      setMessage(res.message);
      handleSelect(selected.id);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleDeleteVenue(id) {
    if (!confirm("Delete this venue?")) return;
    await api.delete(`/admin/venues/${id}`);
    setSelected(null);
    await loadVenues();
  }

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      <div className="dashboard-layout">
        <div className="dashboard-panel">
          <h2>Venues</h2>
          <form onSubmit={handleCreate} className="inline-form">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <input type="number" placeholder="Rows" value={form.rows} onChange={(e) => setForm({ ...form, rows: +e.target.value })} min={1} />
            <input type="number" placeholder="Columns" value={form.columns} onChange={(e) => setForm({ ...form, columns: +e.target.value })} min={1} />
            <button type="submit">Create Venue</button>
          </form>

          <ul className="item-list">
            {venues.map((v) => (
              <li key={v.id} className={selected?.id === v.id ? "active" : ""}>
                <span onClick={() => handleSelect(v.id)}>{v.name} ({v._count.seats} seats)</span>
                <button className="btn-small btn-danger" onClick={() => handleDeleteVenue(v.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {selected && (
          <div className="dashboard-panel">
            <h2>Venue: {selected.name}</h2>
            <p>{selected.rows} rows × {selected.columns} columns | {selected.seats.length} seats</p>

            <h3>Categories</h3>
            <form onSubmit={handleAddCategory} className="inline-form">
              <input placeholder="Name" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required />
              <input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} />
              <input placeholder="Description" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
              <button type="submit">Add Category</button>
            </form>

            <ul className="item-list">
              {selected.seatCategories.map((c) => (
                <li key={c.id} style={{ borderLeft: `4px solid ${c.color}` }}>
                  {c.name} — {c.description || "no description"}
                </li>
              ))}
            </ul>

            <button onClick={handleGenerateSeats} className="btn-primary">
              Generate Seats
            </button>

            {message && <p className="message">{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
