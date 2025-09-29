import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import SearchBar from "./components/SearchBar";
import TasksPage from "./pages/TasksPage";
import TaskDetails from "./pages/TaskDetails";
import WeeklyProgress from "./pages/WeeklyProgress";
import MonthlyProgress from "./pages/MonthlyProgress";
import TaskForm from "./components/TaskForm";

// Header layout — use ONLY for home (Add Task)
function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Toaster position="top-right" />
      <header className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Daily Routine Tracker</h1>
          <div className="flex items-center gap-2">
            <SearchBar />
            <Link
              to="/tasks"
              className="inline-flex items-center justify-center rounded-md bg-black text-white px-3 py-2 text-sm hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
            >
              View Tasks
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

// Bare layout — no header (used for all non-home pages)
function BareLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Toaster position="top-right" />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

// Home shows TaskForm; inject navigation callbacks (TaskForm remains unchanged)
function HomePage() {
  const navigate = useNavigate();
  return (
    <section className="bg-white border rounded-lg p-5">
      <h2 className="text-xl font-semibold mb-4">Add Task</h2>
      <TaskForm
        onOpenWeekly={() => navigate("/progress/weekly")}
        onOpenMonthly={() => navigate("/progress/monthly")}
      />
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ONLY home (Add Task) uses header */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* All other pages WITHOUT header */}
        <Route element={<BareLayout />}>
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
          <Route path="/progress/weekly" element={<WeeklyProgress />} />
          <Route path="/progress/monthly" element={<MonthlyProgress />} />
        </Route>

        {/* Fallback LAST */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}