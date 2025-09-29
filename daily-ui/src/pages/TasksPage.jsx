import { Toaster } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useTasks } from "../state/TasksProvider";
import toast from "react-hot-toast";

export default function TasksPage() {
  const { tasks = [], setTasks, updateTask, deleteTask } = useTasks();
  const navigate = useNavigate();

  const onMarkDone = async (t) => {
    try {
      if (updateTask) {
        const updated = await updateTask(t.id, { status: "DONE" });
        setTasks((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
      } else {
        // Optimistic local-only fallback
        setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: "DONE" } : x)));
      }
      toast.success("Task marked done successfully");
    } catch (e) {
      console.error(e);
      toast.error("Could not mark done");
    }
  };

  const onDelete = async (t) => {
    try {
      if (deleteTask) {
        await deleteTask(t.id);
      }
      setTasks((prev) => prev.filter((x) => x.id !== t.id));
      toast.success("Task deleted successfully");
    } catch (e) {
      console.error(e);
      toast.error("Could not delete task");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="bg-white border rounded-lg p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Tasks</h2>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md bg-black text-white px-3 py-2 text-sm hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
            >
              Home
            </Link>
          </div>

          {tasks.length === 0 ? (
            <p className="text-slate-600">No tasks yet.</p>
          ) : (
            <ul className="divide-y">
              {tasks.map((t) => (
                <li key={t.id} className="py-3 px-2">
                  <div className="flex items-center justify-between gap-3">
                    {/* Title/description opens details */}
                    <button
                      className="flex-1 text-left"
                      onClick={() => navigate(`/tasks/${t.id}`)}
                      title="Open details"
                    >
                      <p className="font-medium truncate">{t.title || "Untitled"}</p>
                      <p className="text-sm text-slate-600 truncate">{t.description}</p>
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onMarkDone(t)}
                        className="px-3 py-1 rounded-md text-sm bg-emerald-600 text-white hover:bg-emerald-700"
                        title="Mark as done"
                      >
                        Mark done
                      </button>
                      <button
                        onClick={() => onDelete(t)}
                        className="px-3 py-1 rounded-md text-sm bg-rose-600 text-white hover:bg-rose-700"
                        title="Delete task"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
