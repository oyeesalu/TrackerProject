import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProgressRing from "../components/ProgressRing";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeeklyProgress() {
  const [checked, setChecked] = useState(() =>
    Object.fromEntries(DAYS.map((d) => [d, false]))
  );
  const toggle = (d) => setChecked((p) => ({ ...p, [d]: !p[d] }));
  const total = DAYS.length;
  const count = Object.values(checked).filter(Boolean).length;
  const pct = useMemo(() => (count / total) * 100, [count, total]);
  const allDone = count === total;

  const reloadWeek = () =>
    setChecked(Object.fromEntries(DAYS.map((d) => [d, false])));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Weekly Progress</h1>
            <p className="text-sm text-slate-600 mt-1">
              Check daily completion and watch the ring fill up to keep a steady rhythm through the week.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {allDone ? (
              <button
                onClick={reloadWeek}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700"
                title="Clear all checks and start a fresh week"
              >
                <span>Reload week</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  <polyline points="21 3 21 12 12 12" />
                </svg>
              </button>
            ) : null}

            <Link
              to="/"
              className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white border rounded-lg p-4">
          <div>
            <h2 className="text-lg font-medium">Overview</h2>
            <p className="text-sm text-slate-600 mt-1">
              {count} of {total} days checked this week
            </p>
          </div>
          <ProgressRing value={pct} size={96} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DAYS.map((d) => (
            <label
              key={d}
              className="flex items-center gap-3 border rounded-md px-3 py-2 cursor-pointer bg-white hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={checked[d]}
                onChange={() => toggle(d)}
                className="h-4 w-4"
              />
              <span className="text-sm">{d}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}