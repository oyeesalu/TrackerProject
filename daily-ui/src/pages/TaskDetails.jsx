import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTask } from '../api/tasks';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

export default function TaskDetails() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { data } = await getTask(id);
        if (!ignore) setTask(data);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load task');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (!task) return <div className="p-4">Not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Toaster position="top-right" />
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Task</h1>
          <div className="flex items-center gap-2">
            <Link to="/" className="rounded-md bg-black text-white px-3 py-2 text-sm">Home</Link>
            <Link to="/tasks" className="rounded-md bg-slate-900 text-white px-3 py-2 text-sm">All Tasks</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <section className="bg-white border rounded-lg p-5 space-y-6">
          <div>
            <h2 className="text-xl font-semibold">{task.title}</h2>
            <p className="text-slate-600">{task.description || 'No description'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Info label="Status" value={task.status} />
            <Info label="Assignee" value={task.assignee || 'Unassigned'} />
          </div>

          <div className="pt-2">
            <button
              onClick={() => toast.success('Notification scheduled (placeholder)')}
              className="px-4 py-2 rounded-md bg-violet-600 text-white text-sm hover:bg-violet-700"
            >
              Notify me
            </button>
          </div>
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