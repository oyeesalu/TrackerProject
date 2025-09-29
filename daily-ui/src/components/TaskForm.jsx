
import { useEffect, useMemo, useState } from 'react';
import { useTasks } from '../state/TasksProvider';
import { createTask } from '../api/tasks';
import toast from 'react-hot-toast';

const SLOTS = {
  MORNING:   { label: 'Morning Tasks',   start: '06:00', end: '10:00' },
  AFTERNOON: { label: 'Afternoon Tasks', start: '12:00', end: '16:00' },
  EVENING:   { label: 'Evening Tasks',   start: '17:00', end: '20:00' },
  NIGHT:     { label: 'Night Tasks',     start: '21:00', end: '23:00' },
};

// ---------- time helpers ----------
const pad = (n) => n.toString().padStart(2, '0');
const minutesBetween = (t1, t2) => {
  const [h1, m1] = t1.split(':').map(Number);
  const [h2, m2] = t2.split(':').map(Number);
  return Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
};
const to12h = (t24) => {
  const [h, m] = t24.split(':').map(Number);
  const am = h < 12 || h === 24;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { h12, m, suffix: am ? 'AM' : 'PM' };
};
const fmt24 = (h12, m, mer) => {
  let h = (Number(h12) % 12) + (mer === 'PM' ? 12 : 0);
  return `${pad(h)}:${pad(m)}`;
};

function nowIST() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 3600000);
}
function greeting(h) {
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}
function formatGreetingLine(d) {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const pad2 = (n) => n.toString().padStart(2, '0');
  const day = days[d.getDay()];
  const date = `${pad2(d.getDate())}-${pad2(d.getMonth()+1)}-${d.getFullYear()}`;
  const hours = d.getHours();
  const mins = pad2(d.getMinutes());
  const suffix = hours < 12 ? 'AM' : 'PM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${greeting(hours)} • ${day}, ${date} • ${h12}:${mins} ${suffix}`;
}

// ---------- TimeRange field ----------
function TimeRangeField({ label, value, onChange }) {
  const { start, end, meridiem } = value;
  const s = to12h(start);
  const e = to12h(end);

  const update = (part, payload) => {
    if (part === 'startH') return onChange({ ...value, start: fmt24(payload.h, s.m, meridiem) });
    if (part === 'startM') return onChange({ ...value, start: fmt24(s.h12, payload.m, meridiem) });
    if (part === 'endH')   return onChange({ ...value, end: fmt24(payload.h, e.m, meridiem) });
    if (part === 'endM')   return onChange({ ...value, end: fmt24(e.h12, payload.m, meridiem) });
    if (part === 'mer')    return onChange({
      ...value,
      meridiem: payload.meridiem,
      start: fmt24(s.h12, s.m, payload.meridiem),
      end: fmt24(e.h12, e.m, payload.meridiem),
    });
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm sm:text-base font-medium text-slate-700">{label}</label>
      <div className="flex flex-wrap items-center gap-3">
        {/* Start */}
        <div className="flex items-center gap-2" aria-label="Start time">
          <span className="text-xs sm:text-sm text-slate-500">Start</span>
          <input
            type="number" inputMode="numeric" min="1" max="12"
            value={s.h12}
            onChange={(e)=>update('startH',{h:Math.min(12,Math.max(1,Number(e.target.value)||1))})}
            className="w-14 border rounded px-2 py-2 text-sm sm:text-base"
          />
          <span>:</span>
          <input
            type="number" inputMode="numeric" min="0" max="59"
            value={s.m}
            onChange={(e)=>update('startM',{m:Math.min(59,Math.max(0,Number(e.target.value)||0))})}
            className="w-14 border rounded px-2 py-2 text-sm sm:text-base"
          />
        </div>
        {/* End */}
        <div className="flex items-center gap-2" aria-label="End time">
          <span className="text-xs sm:text-sm text-slate-500">End</span>
          <input
            type="number" inputMode="numeric" min="1" max="12"
            value={e.h12}
            onChange={(e)=>update('endH',{h:Math.min(12,Math.max(1,Number(e.target.value)||1))})}
            className="w-14 border rounded px-2 py-2 text-sm sm:text-base"
          />
          <span>:</span>
          <input
            type="number" inputMode="numeric" min="0" max="59"
            value={e.m}
            onChange={(e)=>update('endM',{m:Math.min(59,Math.max(0,Number(e.target.value)||0))})}
            className="w-14 border rounded px-2 py-2 text-sm sm:text-base"
          />
        </div>
        {/* AM/PM segmented */}
        <div role="group" aria-label="AM or PM" className="inline-flex rounded-md border overflow-hidden">
          {['AM','PM'].map((opt)=>(
            <button
              key={opt}
              type="button"
              onClick={()=>update('mer',{meridiem:opt})}
              aria-pressed={meridiem===opt}
              className={'px-3 py-2 text-sm sm:text-base ' + (meridiem===opt? 'bg-slate-900 text-white':'bg-white hover:bg-slate-50')}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TaskForm({ onOpenWeekly, onOpenMonthly }) {
  const { setTasks } = useTasks();

  // Date and greeting
  const todayStr = useMemo(() => nowIST().toISOString().slice(0, 10), []);
  const [dueDate, setDueDate] = useState(todayStr);
  const [clock, setClock] = useState(() => nowIST());
  useEffect(() => { const id = setInterval(() => setClock(nowIST()), 1000); return () => clearInterval(id); }, []);
  const greetLine = formatGreetingLine(clock);

  // Slots / notes
  const [active, setActive] = useState('MORNING');
  const [notes, setNotes] = useState({ MORNING:'', AFTERNOON:'', EVENING:'', NIGHT:'' });

  // Title and assignee
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');

  // Time range
  const [range, setRange] = useState({
    start: SLOTS.MORNING.start,
    end: SLOTS.MORNING.end,
    meridiem: to12h(SLOTS.MORNING.start).suffix,
  });
  const start24 = range.start;
  const end24 = range.end;


  const titleError = !title.trim() ? 'Title is required' : '';
  const rangeError = minutesBetween(start24, end24) <= 0 ? 'End must be after Start' : '';


  const selectCategory = (key) => {
    setActive(key);
    setRange({
      start: SLOTS[key].start,
      end: SLOTS[key].end,
      meridiem: to12h(SLOTS[key].start).suffix,
    });
  };

  const description = useMemo(() => {
    const txt = (notes[active] || '').trim();
    return txt ? `${SLOTS[active].label}:\n${txt}` : '';
  }, [notes, active]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (titleError || rangeError) return;

    const payload = {
      title: title.trim(),
      description,
      assignee: assignee.trim(),
      dueDate,
      status: 'PENDING',
      priority: 'LOW',
      startTime: start24,
      endTime: end24,
      estimateMins: minutesBetween(start24, end24),
      slot: active,
    };

    try {
      const { data } = await createTask(payload);
      setTasks((prev) => [data, ...prev]);
      toast.success('Task added');
      setTitle('');
      setAssignee('');
      setNotes((p) => ({ ...p, [active]: '' }));
      setRange({
        start: SLOTS[active].start,
        end: SLOTS[active].end,
        meridiem: to12h(SLOTS[active].start).suffix,
      });
    } catch (err) {
      console.error(err);
      toast.error('Could not add task');
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="text-base sm:text-lg">
      {/* Greeting + date */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
        <p className="text-base sm:text-lg font-medium">{greetLine}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base text-slate-600">Plan for:</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e)=>setDueDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left rail */}
        <div className="lg:col-span-1">
          <div className="flex flex-col gap-2">
            {Object.entries(SLOTS).map(([key, meta]) => (
              <button
                key={key}
                type="button"
                onClick={() => selectCategory(key)}
                className={
                  'w-full text-left px-3 py-2 rounded border text-sm sm:text-base ' +
                  (active === key ? 'bg-slate-900 text-white border-slate-900' : 'hover:bg-slate-50')
                }
                aria-pressed={active === key}
              >
                {meta.label}
              </button>
            ))}
          </div>

          {/* Progress buttons under slots */}
          <div className="mt-4 flex items-center gap-3 justify-start">
            <button type="button" onClick={onOpenWeekly}
              className="px-5 py-2 rounded-md border text-sm sm:text-base hover:bg-slate-50">
              Weekly progress
            </button>
            <button type="button" onClick={onOpenMonthly}
              className="px-5 py-2 rounded-md border text-sm sm:text-base hover:bg-slate-50">
              Monthly progress
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Task to-do */}
          <div>
            <label htmlFor="taskTitle" className="block text-sm sm:text-base font-medium text-slate-700 mb-1">
              Task to-do
            </label>
            <input
              id="taskTitle"
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
              placeholder="e.g., Write daily report"
              className={`w-full border rounded-md px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-black ${titleError ? 'border-red-500' : ''}`}
              aria-invalid={!!titleError}
              aria-describedby={titleError ? 'title-err' : undefined}
            />
            {titleError && <p id="title-err" className="text-red-600 text-xs sm:text-sm mt-1">Title is required</p>}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm sm:text-base font-medium text-slate-700 mb-1">
              {SLOTS[active].label} notes
            </label>
            <textarea
              id="notes"
              value={notes[active]}
              onChange={(e)=>setNotes((p)=> ({ ...p, [active]: e.target.value }))}
              placeholder="Add tasks/steps for this part of the day…"
              className="w-full border rounded-md px-3 py-2 text-sm sm:text-base h-28 focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Time range */}
          <TimeRangeField label="Time range" value={range} onChange={setRange} />

          {/* Assignee */}
          <div>
            <label htmlFor="assignee" className="block text-sm sm:text-base font-medium text-slate-700 mb-1">
              Assignee
            </label>
            <input
              id="assignee"
              value={assignee}
              onChange={(e)=>setAssignee(e.target.value)}
              placeholder="Optional — name or self"
              className="w-full border rounded-md px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          className="px-5 py-2 rounded-md bg-black text-white text-sm sm:text-base hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
          disabled={!!(titleError || rangeError)}
        >
          Add Task
        </button>
      </div>
    </form>
  );
}
