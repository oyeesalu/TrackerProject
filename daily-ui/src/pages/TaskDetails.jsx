import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTask, updateTask as apiUpdateTask } from "../api/tasks";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

const REM_LS_KEY = "drt.reminders.v1"; // { [taskId]: true }

function readReminders() {
  try {
    const raw = localStorage.getItem(REM_LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function writeReminders(map) {
  try {
    localStorage.setItem(REM_LS_KEY, JSON.stringify(map));
  } catch {}
}

export default function TaskDetails() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  // reminder state for this task
  const [reminding, setReminding] = useState(() => !!readReminders()[id]);
  const timerRef = useRef(null);

  // Load task
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { data } = await getTask(id);
        if (!ignore) setTask(data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load task");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [id]);

  // Interval for reminders
  useEffect(() => {
    // clear existing
    clearInterval(timerRef.current);
    timerRef.current = null;

    if (!reminding) return;

    const send = () => {
      const title = (task?.title || "Task pending") + "";
      const body = "This is still pending. Stay on it!";
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(title, { body });
        } catch {
          toast(title + ": " + body);
        }
      } else {
        toast(title + ": " + body);
      }
    };

    // fire once immediately
    send();

    // every 30 minutes
    const INTERVAL_MS = 30 * 60 * 1000;
    timerRef.current = setInterval(send, INTERVAL_MS);

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [reminding, task?.title]);

  // Persist reminder flag for this task
  useEffect(() => {
    const m = readReminders();
    if (reminding) m[id] = true;
    else delete m[id];
    writeReminders(m);
  }, [reminding, id]);

  // Auto-stop reminders if task is DONE
  useEffect(() => {
    if (task?.status === "DONE" && reminding) {
      setReminding(false);
    }
  }, [task?.status, reminding]);

  const startReminding = async () => {
    try {
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
    } catch {}
    setReminding(true);
    toast.success("Will remind every 30 minutes");
  };

  const stopReminding = () => {
    setReminding(false);
    toast("Reminders stopped");
  };

  const markDone = async () => {
    try {
      // optimistic UI; call API if available
      const next = { ...task, status: "DONE" };
      setTask(next);
      await apiUpdateTask?.(id, { status: "DONE" });
      toast.success("Marked as done");
    } catch (e) {
      console.error(e);
      toast.error("Could not update");
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;
  if (!task) return <div className="p-4">Not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Toaster position="top-right" />
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Task</h1>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-md bg-black text-white px-3 py-2 text-sm hover:bg-neutral-900"
            >
              Home
            </Link>
            <Link
              to="/tasks"
              className="rounded-md bg-slate-900 text-white px-3 py-2 text-sm hover:bg-slate-800"
            >
              All Tasks
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <section className="bg-white border rounded-lg p-5 space-y-6">
          <div>
            <h2 className="text-xl font-semibold">{task.title}</h2>
            <p className="text-slate-600">{task.description || "No description"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Info label="Status" value={task.status} />
            <Info label="Assignee" value={task.assignee || "Unassigned"} />
          </div>

          <div className="pt-2 flex items-center gap-2">
            {task.status !== "DONE" && (
              <>
                {!reminding ? (
                  <button
                    onClick={startReminding}
                    className="px-4 py-2 rounded-md bg-violet-600 text-white text-sm hover:bg-violet-700"
                  >
                    Notify me (30m)
                  </button>
                ) : (
                  <button
                    onClick={stopReminding}
                    className="px-4 py-2 rounded-md bg-rose-600 text-white text-sm hover:bg-rose-700"
                  >
                    Stop notifying
                  </button>
                )}
              </>
            )}

            {task.status !== "DONE" && (
              <button
                onClick={markDone}
                className="px-4 py-2 rounded-md border text-sm hover:bg-slate-50"
              >
                Mark done
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Notifications require this tab to stay open; browsers may limit background alerts.
          </p>
        </section>
      </main>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="text-sm">
      <p className="text-slate-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
