import { useState, useEffect, useCallback } from "react";
import { connectSocket } from "../services/socket";

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

  const getSeatStatus = useCallback(
    (showSeatId, serverStatus) => {
      if (liveSeats[showSeatId]) return liveSeats[showSeatId].status;
      return serverStatus;
    },
    [liveSeats],
  );

  if (!seatGrid || seatGrid.length === 0) {
    return <p>No seats available for this event.</p>;
  }

  return (
    <div className="seat-map-container">
      <div className="seat-legend">
        {categories.map((cat) => (
          <span key={cat.id} className="legend-item">
            <span className="legend-swatch" style={{ background: cat.color }} />
            {cat.name}
          </span>
        ))}
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: "#4caf50" }} />
          Available
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: "#ff9800" }} />
          Held
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: "#f44336" }} />
          Booked
        </span>
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
