import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

export default function AdminDashboard() {
  const [venues, setVenues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", rows: 10, columns: 12 });
  const [catForm, setCatForm] = useState({ name: "", color: "#FFD700", description: "" });
  const [message, setMessage] = useState("");

  async function loadVenues() { setVenues(await api.get("/admin/venues")); }
  useEffect(() => { loadVenues(); }, []);

  async function handleCreate(e) {
    e.preventDefault(); setMessage("");
    await api.post("/admin/venues", form);
    setForm({ name: "", address: "", rows: 10, columns: 12 });
    await loadVenues();
    setMessage("Venue created");
  }

  async function handleSelect(id) {
    setSelected(await api.get(`/admin/venues/${id}`));
    setMessage("");
  }

  async function handleAddCategory(e) {
    e.preventDefault(); if (!selected) return;
    await api.post(`/admin/venues/${selected.id}/categories`, catForm);
    setCatForm({ name: "", color: "#FFD700", description: "" });
    handleSelect(selected.id);
  }

  async function handleGenerateSeats() {
    if (!selected) return; setMessage("");
    try {
      const res = await api.post(`/admin/venues/${selected.id}/generate-seats`);
      setMessage(res.message);
      handleSelect(selected.id);
    } catch (err) { setMessage(err.message); }
  }

  async function handleDeleteVenue(id) {
    if (!confirm("Delete this venue?")) return;
    await api.delete(`/admin/venues/${id}`);
    setSelected(null);
    await loadVenues();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Venues</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="flex-1 min-w-[120px]" />
              <Input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="flex-1 min-w-[120px]" />
              <Input type="number" placeholder="Rows" value={form.rows} onChange={(e) => setForm({ ...form, rows: +e.target.value })} min={1} className="w-20" />
              <Input type="number" placeholder="Cols" value={form.columns} onChange={(e) => setForm({ ...form, columns: +e.target.value })} min={1} className="w-20" />
              <Button type="submit" size="sm">Create</Button>
            </form>

            <div className="item-list">
              {venues.map((v) => (
                <div key={v.id} className={`flex justify-between items-center px-3 py-2.5 border-b border-border cursor-pointer text-sm transition-colors hover:bg-muted ${selected?.id === v.id ? "bg-primary/10 font-semibold" : ""}`}>
                  <span onClick={() => handleSelect(v.id)} className="flex-1">{v.name} <span className="text-muted-foreground font-normal">({v._count.seats} seats)</span></span>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteVenue(v.id)}>Delete</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selected && (
          <Card>
            <CardHeader><CardTitle>Venue: {selected.name}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{selected.rows} rows × {selected.columns} columns · {selected.seats.length} seats</p>

              <div>
                <h4 className="text-sm font-semibold mb-2">Categories</h4>
                <form onSubmit={handleAddCategory} className="flex flex-wrap gap-2 mb-3">
                  <Input placeholder="Name" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required className="flex-1" />
                  <Input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} className="w-10 p-1" />
                  <Input placeholder="Description" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} className="flex-1" />
                  <Button type="submit" size="sm">Add</Button>
                </form>
                <div className="space-y-1">
                  {selected.seatCategories?.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 text-sm px-2 py-1.5 border-l-4 rounded" style={{ borderLeftColor: c.color }}>
                      <span>{c.name}</span>
                      {c.description && <span className="text-muted-foreground text-xs">— {c.description}</span>}
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleGenerateSeats} variant="outline">Generate Seats</Button>

              {message && <p className="text-sm text-green-700 bg-green-50 p-3 rounded-md">{message}</p>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
