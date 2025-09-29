
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const TasksCtx = createContext(null);
const STORAGE_KEY = "drt.tasks.v1";

export default function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);


  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setTasks(parsed);
      }
    } catch (e) {
      console.error("Failed to read tasks from storage", e);
    }
  }, []);


  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error("Failed to write tasks to storage", e);
    }
  }, [tasks]);


  const addTask = async (task) => task;
  const updateTask = async (id, patch) => {
    const updated = (prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t));
    let next = [];
    setTasks((prev) => (next = updated(prev)));
    return next.find((t) => t.id === id);
  };
  const deleteTask = async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    return true;
  };

  const value = useMemo(
    () => ({ tasks, setTasks, addTask, updateTask, deleteTask }),
    [tasks]
  );

  return <TasksCtx.Provider value={value}>{children}</TasksCtx.Provider>;
}

export const useTasks = () => useContext(TasksCtx);
