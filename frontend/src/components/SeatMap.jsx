import { useState, useEffect, useCallback } from "react";
import { connectSocket } from "../services/socket";
import { Badge } from "./ui/badge";

export default function SeatMap({ seatGrid, categories, eventId, selectedSeats, onToggleSeat, heldByMe }) {
  const [liveSeats, setLiveSeats] = useState({});

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    socket.emit("join:event", eventId);

    const handler = (data) => {
      setLiveSeats((prev) => {
        const next = { ...prev };
        for (const id of data.showSeatIds) {
          next[id] = { status: data.status, heldBy: data.heldBy, heldUntil: data.heldUntil };
        }
        return next;
      });
    };

    socket.on("seat:updated", handler);
    return () => {
      socket.off("seat:updated", handler);
      socket.emit("leave:event", eventId);
    };
  }, [eventId]);

  const getSeatStatus = useCallback((showSeatId, serverStatus) => {
    if (liveSeats[showSeatId]) return liveSeats[showSeatId].status;
    return serverStatus;
  }, [liveSeats]);

  if (!seatGrid || seatGrid.length === 0) {
    return <p className="text-muted-foreground py-8 text-center">No seats available for this event.</p>;
  }

  return (
    <div className="bg-card border rounded-xl p-6 space-y-4">
      <div className="flex flex-wrap gap-4 pb-3 border-b">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-3.5 h-3.5 rounded-sm inline-block" style={{ background: cat.color }} />
            {cat.name}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-3.5 h-3.5 rounded-sm inline-block bg-green-400" /> Available
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-3.5 h-3.5 rounded-sm inline-block bg-orange-400" /> Held
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-3.5 h-3.5 rounded-sm inline-block bg-red-400" /> Booked
        </div>
      </div>

      <div className="seat-grid">
        {seatGrid.map((row) => (
          <div key={row.rowLabel} className="seat-row">
            <span className="row-label">{row.rowLabel}</span>
            <div className="row-seats">
              {row.seats.map((seat) => {
                const status = getSeatStatus(seat.id, seat.status);
                const isSelected = selectedSeats.includes(seat.id);
                const isSelectable = status === "available" || (status === "held" && seat.heldBy === heldByMe);
                const isMine = status === "held" && seat.heldBy === heldByMe;

                return (
                  <button
                    key={seat.id}
                    className={`seat ${status} ${isSelected ? "selected" : ""} ${isMine ? "mine" : ""}`}
                    style={status === "available" || isMine ? { borderColor: seat.category.color } : {}}
                    disabled={!isSelectable}
                    onClick={() => isSelectable && onToggleSeat(seat.id)}
                    title={`${seat.label} - ${seat.category.name} (${status})`}
                  >
                    {seat.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
