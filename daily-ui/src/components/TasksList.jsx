import { Toaster } from "react-hot-toast";
import TaskForm from "../components/TaskForm";
import { Link, useNavigate } from "react-router-dom";

export default function TasksPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />

      <header className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Daily Routine Tracker</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/tasks"
              className="inline-flex items-center justify-center rounded-md bg-black text-white px-3 py-2 text-sm hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
            >
              View Tasks
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md bg-slate-800 text-white px-3 py-2 text-sm hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-10">
        <section className="bg-white border rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-4">Add Task</h2>
          <TaskForm
            onOpenWeekly={() => navigate("/progress/weekly")}
            onOpenMonthly={() => navigate("/progress/monthly")}
          />
        </section>
      </main>
    </div>
  );
}
