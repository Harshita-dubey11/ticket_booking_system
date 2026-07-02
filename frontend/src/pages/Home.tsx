import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      <h1>Ticket Booking System</h1>
      {user ? (
        <p>Welcome back, {user.name}!</p>
      ) : (
        <p>Browse events and book your seats.</p>
      )}
    </div>
  );
}
