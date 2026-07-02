import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";

export default function AdminDashboard() {
  const [venues, setVenues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("list");
  const [form, setForm] = useState({ name: "", address: "", rows: 10, columns: 12 });
  const [catForm, setCatForm] = useState({ name: "", color: "#FFD700", description: "" });
  const [message, setMessage] = useState({ text: "", type: "" });

  async function loadVenues() { setVenues(await api.get("/admin/venues")); }
  useEffect(() => { loadVenues(); }, []);

  function showMsg(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  }

  async function handleCreate(e) {
    e.preventDefault(); setMessage({ text: "", type: "" });
    try {
      await api.post("/admin/venues", form);
      showMsg("Venue created");
      setForm({ name: "", address: "", rows: 10, columns: 12 });
      await loadVenues();
    } catch (err) { showMsg(err.message, "error"); }
  }

  async function handleSelect(id) {
    try {
      setSelected(await api.get(`/admin/venues/${id}`));
      setTab("manage");
    } catch (err) { showMsg(err.message, "error"); }
  }

  async function handleAddCategory(e) {
    e.preventDefault(); if (!selected) return; setMessage({ text: "", type: "" });
    try {
      await api.post(`/admin/venues/${selected.id}/categories`, catForm);
      setCatForm({ name: "", color: "#FFD700", description: "" });
      showMsg("Category added");
      handleSelect(selected.id);
    } catch (err) { showMsg(err.message, "error"); }
  }

  async function handleGenerateSeats() {
    if (!selected) return; setMessage({ text: "", type: "" });
    try {
      const res = await api.post(`/admin/venues/${selected.id}/generate-seats`);
      showMsg(res.message);
      handleSelect(selected.id);
    } catch (err) { showMsg(err.message, "error"); }
  }

  async function handleDeleteVenue(id) {
    if (!confirm("Delete this venue? All associated seats and data will be removed.")) return;
    try {
      await api.delete(`/admin/venues/${id}`);
      showMsg("Venue deleted");
      setSelected(null);
      setTab("list");
      await loadVenues();
    } catch (err) { showMsg(err.message, "error"); }
  }

  const seatCounts = {};
  for (const cat of selected?.seatCategories || []) {
    seatCounts[cat.id] = selected.seats?.filter((s) => s.categoryId === cat.id).length || 0;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage venues, categories, and seat layouts</p>
        </div>
        <Button onClick={() => { setTab("list"); setSelected(null); }} variant={tab === "list" ? "default" : "outline"} size="sm">All Venues</Button>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === "error" ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {message.text}
        </div>
      )}

      {tab === "list" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Create New Venue</CardTitle>
              <CardDescription>Define a venue layout with rows and columns. You can add seat categories and generate seats later.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2 sm:col-span-2 lg:col-span-4">
                  <label className="text-sm font-medium">Venue Name</label>
                  <Input placeholder="e.g. Grand Cinema Hall" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-4">
                  <label className="text-sm font-medium">Address</label>
                  <Input placeholder="123 Main Street" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rows</label>
                  <Input type="number" placeholder="10" value={form.rows} onChange={(e) => setForm({ ...form, rows: +e.target.value })} min={1} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Columns (per row)</label>
                  <Input type="number" placeholder="12" value={form.columns} onChange={(e) => setForm({ ...form, columns: +e.target.value })} min={1} />
                </div>
                <div className="sm:col-span-2 lg:col-span-4 pt-2">
                  <Button type="submit" className="w-full sm:w-auto">Create Venue</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {venues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>All Venues ({venues.length})</CardTitle>
                <CardDescription>Click on a venue to manage categories and seat layout</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border rounded-lg border">
                  {venues.map((v) => (
                    <div key={v.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => handleSelect(v.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{v.name}</span>
                          <Badge variant="secondary" className="text-xs">{v._count?.seats || 0} seats</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">
                          {v.seatCategories?.length || 0} categories · {v.rows} rows × {v.columns} cols{v.address ? ` · ${v.address}` : ""}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleSelect(v.id); }}>Manage</Button>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteVenue(v.id); }}>Delete</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {tab === "manage" && selected && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selected.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {selected.rows} rows × {selected.columns} columns · {selected.seats.length} seats
                      {selected.address && <> · {selected.address}</>}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{selected.seats.length} seats</Badge>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-5 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                    Seat Categories
                  </h4>
                  <form onSubmit={handleAddCategory} className="flex flex-wrap gap-2 mb-4">
                    <Input placeholder="Category name" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required className="flex-1 min-w-[120px]" />
                    <Input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} className="w-10 p-1 h-9" />
                    <Input placeholder="Description (optional)" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} className="flex-1 min-w-[120px]" />
                    <Button type="submit" size="sm">Add</Button>
                  </form>

                  {selected.seatCategories?.length > 0 ? (
                    <div className="space-y-1.5">
                      {selected.seatCategories.map((c) => (
                        <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-card">
                          <span className="w-4 h-4 rounded shrink-0 ring-1 ring-black/5" style={{ background: c.color }} />
                          <span className="text-sm font-medium">{c.name}</span>
                          {c.description && <span className="text-xs text-muted-foreground">— {c.description}</span>}
                          <Badge variant="outline" className="ml-auto text-xs">{seatCounts[c.id] || 0} seats</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">No categories yet. Add one above.</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold mb-2">Seat Layout</h4>
                  <p className="text-xs text-muted-foreground mb-3">Auto-generate seats evenly distributed across categories (first rows get first category, etc.)</p>
                  <Button onClick={handleGenerateSeats} variant="outline" disabled={selected.seatCategories?.length === 0}>
                    {selected.seats.length > 0 ? "Regenerate Seats" : "Generate Seats"}
                  </Button>
                  {selected.seatCategories?.length === 0 && (
                    <p className="text-xs text-destructive mt-2">Add at least one category before generating seats.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {selected.seats?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                    Seat Preview
                  </CardTitle>
                  <CardDescription>First few rows of the seat layout</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-5">
                  <div className="seat-grid">
                    {Object.entries(
                      Object.groupBy
                        ? Object.groupBy(selected.seats.slice(0, 48), (s) => s.rowLabel)
                        : selected.seats.slice(0, 48).reduce((acc, s) => {
                            if (!acc[s.rowLabel]) acc[s.rowLabel] = [];
                            acc[s.rowLabel].push(s);
                            return acc;
                          }, {})
                    ).sort(([a], [b]) => a.localeCompare(b)).slice(0, 4).map(([rowLabel, rowSeats]) => (
                      <div key={rowLabel} className="seat-row">
                        <span className="row-label">{rowLabel}</span>
                        <div className="row-seats">
                          {rowSeats.map((seat) => (
                            <div
                              key={seat.id}
                              className="w-7 h-7 rounded text-[9px] font-semibold flex items-center justify-center border"
                              style={{ background: seat.category?.color + "30", borderColor: seat.category?.color, color: seat.category?.color }}
                              title={`${seat.label} - ${seat.category?.name}`}
                            >
                              {seat.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button variant="outline" onClick={() => { setTab("list"); setSelected(null); }} className="w-full">← Back to Venues</Button>
          </div>
        </div>
      )}
    </div>
  );
}
