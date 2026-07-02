import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
        <span className="text-4xl font-bold text-muted-foreground/40">404</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground text-sm text-center max-w-sm">The page you're looking for doesn't exist or you may not have access to it.</p>
      <div className="flex gap-3 mt-2">
        <Link to="/"><Button>Go Home</Button></Link>
        <Link to="/events"><Button variant="outline">Browse Events</Button></Link>
      </div>
    </div>
  );
}
