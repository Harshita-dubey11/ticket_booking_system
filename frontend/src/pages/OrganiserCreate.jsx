import { Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const actions = [
  {
    title: "Create Event",
    desc: "Set up a new movie or concert event with date, venue, and duration",
    to: "/organiser",
    color: "from-indigo-500 to-blue-600",
    icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  },
  {
    title: "Set Pricing",
    desc: "Configure per-category ticket pricing for your events",
    to: "/my-events",
    color: "from-violet-500 to-purple-600",
    icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    title: "View Revenue",
    desc: "Track booking revenue and sales summary per event",
    to: "/my-events",
    color: "from-emerald-500 to-teal-600",
    icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  },
  {
    title: "My Events",
    desc: "Browse all your events, manage pricing, and view performance",
    to: "/my-events",
    color: "from-amber-500 to-orange-600",
    icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  },
];

export default function OrganiserCreate() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organiser Actions</h1>
        <p className="text-muted-foreground mt-1">Create events, set pricing, and track revenue</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {actions.map((a) => (
          <Link key={a.title} to={a.to}>
            <Card className="card-hover overflow-hidden border-0 shadow-md">
              <div className={`h-1.5 bg-gradient-to-r ${a.color}`} />
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white shrink-0`}>
                    {a.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{a.title}</h3>
                    <p className="text-sm text-muted-foreground">{a.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
