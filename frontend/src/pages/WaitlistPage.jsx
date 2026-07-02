import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function WaitlistPage() {
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => { api.get("/waitlist").then(setEntries).catch(() => {}); }, []);

  async function handleLeave(id) {
    if (!confirm("Leave the waitlist?")) return;
    try {
      await api.delete(`/waitlist/${id}`);
      setMessage("Removed from waitlist");
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) { setMessage(err.message); }
  }

  const statusVariant = { waiting: "secondary", offered: "default", expired: "outline", booked: "default", cancelled: "outline" };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Waitlist</h1>
      {message && <p className="text-sm text-green-700 bg-green-50 p-3 rounded-md">{message}</p>}
      {entries.length === 0 && <p className="text-muted-foreground">You are not on any waitlists.</p>}

      <div className="space-y-3">
        {entries.map((e) => (
          <Card key={e.id}>
            <CardContent className="p-5 space-y-1.5">
              <h3 className="font-semibold">{e.event?.title}</h3>
              <p className="text-sm text-muted-foreground">{e.event?.venue?.name} · {new Date(e.event?.date).toLocaleDateString()}</p>
              <p className="text-sm" style={{ color: e.category?.color }}>Category: {e.category?.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={statusVariant[e.status] || "outline"}>{e.status}</Badge>
                {e.status === "waiting" && <Button variant="destructive" size="sm" onClick={() => handleLeave(e.id)}>Leave</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
