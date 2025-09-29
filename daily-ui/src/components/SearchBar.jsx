import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../state/TasksProvider';

export default function SearchBar() {
  const { tasks = [] } = useTasks();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const boxRef = useRef(null);

  const q = term.trim().toLowerCase();

  useEffect(() => {
    const id = setTimeout(() => {
      if (q.length < 2) {
        setResults([]);
        setOpen(false);
        return;
      }

      const filtered = tasks.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.assignee?.toLowerCase().includes(q)
      );

      setResults(filtered.slice(0, 8));
      setOpen(filtered.length > 0);
    }, 200);

    return () => clearTimeout(id);
  }, [q, tasks]);

  const pick = (id) => {
    setOpen(false);
    setTerm('');
    navigate(`/tasks/${id}`);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      pick(results[0].id);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const hint = useMemo(() => {
    if (q.length === 0) return 'Type to search';
    if (q.length < 2) return 'Keep typing…';
    if (q.length >= 2 && results.length === 0) return 'No matches';
    return null;
  }, [q, results]);

  return (
    <div className="relative" ref={boxRef}>
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onFocus={() => q.length >= 2 && setOpen(results.length > 0)}
        onKeyDown={onKeyDown}
        className="w-64 md:w-80 border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
        placeholder="Search tasks…"
        aria-label="Search tasks"
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow">
          {results.length > 0 ? (
            results.map((t) => (
              <button
                key={t.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(t.id)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{t.title}</span>
                  <span className="ml-3 text-xs text-slate-500">{t.status}</span>
                </div>
                <div className="text-xs text-slate-500 truncate">{t.description}</div>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-slate-500">{hint}</div>
          )}
        </div>
      )}
    </div>
  );
}
