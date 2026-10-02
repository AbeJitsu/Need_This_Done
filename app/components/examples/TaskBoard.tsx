"use client";

import { useEffect, useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  initialTasks,
  parseSavedTasks,
  TASK_STORAGE_KEY,
  type DemoTask,
} from "@/lib/portfolio-examples";

export default function TaskBoard({ compact = false }: { compact?: boolean }) {
  const [tasks, setTasks] = useState<DemoTask[]>(initialTasks);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [loaded, setLoaded] = useState(false);
  const [storage, setStorage] = useState("Changes stay in this browser.");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TASK_STORAGE_KEY);
      if (raw) {
        const saved = parseSavedTasks(raw);
        if (saved) setTasks(saved);
        else
          setNotice(
            "Saved data could not be read. Sample tasks have been restored.",
          );
      }
    } catch {
      setStorage(
        "Browser storage is unavailable. Changes last until you leave.",
      );
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      setStorage(
        "Browser storage is unavailable. Changes last until you leave.",
      );
    }
  }, [tasks, loaded]);
  const complete = tasks.filter((task) => task.status === "done").length;
  const visible = tasks.filter(
    (task) => filter === "all" || task.status === filter,
  );
  const Title = compact ? "h2" : "h3";
  return (
    <div className={`pf-board ${compact ? "pf-board--compact" : ""}`}>
      <div className="pf-board-top">
        <div>
          <span className="pf-mono">EXAMPLE / REACT STATE</span>
          <Title>Small tasks. Clear progress.</Title>
        </div>
        <span className="pf-pill">Browser demo</span>
      </div>
      <div className="pf-board-progress">
        <span>
          {complete} of {tasks.length} complete
        </span>
        <span>
          {tasks.length ? Math.round((complete / tasks.length) * 100) : 0}%
        </span>
      </div>
      <progress
        aria-label="Completed tasks"
        max={Math.max(tasks.length, 1)}
        value={complete}
      />
      {!compact && (
        <div className="pf-board-controls">
          <label>
            Show tasks
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">All tasks</option>
              <option value="todo">To do</option>
              <option value="doing">In progress</option>
              <option value="done">Complete</option>
            </select>
          </label>
          <button
            type="button"
            className="pf-quiet-button"
            onClick={() => {
              setTasks(initialTasks);
              setFilter("all");
              setNotice("Sample tasks restored.");
            }}
          >
            <RotateCcw size={15} aria-hidden="true" /> Reset example
          </button>
        </div>
      )}
      <ul className="pf-task-list">
        {(compact ? visible.slice(0, 3) : visible).map((task) => (
          <li key={task.id}>
            <span
              className={`pf-task-dot pf-task-dot--${task.status}`}
              aria-hidden="true"
            />
            <span className={task.status === "done" ? "pf-task-done" : ""}>
              {task.title}
            </span>
            <select
              aria-label={`Status for ${task.title}`}
              value={task.status}
              onChange={(event) => {
                const status = event.target.value as DemoTask["status"];
                setTasks((current) =>
                  current.map((item) =>
                    item.id === task.id ? { ...item, status } : item,
                  ),
                );
                setNotice(
                  `${task.title}: ${status === "done" ? "Complete" : status === "doing" ? "In progress" : "To do"}.`,
                );
              }}
            >
              <option value="todo">To do</option>
              <option value="doing">In progress</option>
              <option value="done">Complete</option>
            </select>
            {!compact && (
              <button
                type="button"
                className="pf-icon-button"
                aria-label={`Delete ${task.title}`}
                onClick={() => {
                  setTasks((current) =>
                    current.filter((item) => item.id !== task.id),
                  );
                  setNotice(`${task.title} removed.`);
                }}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {visible.length === 0 && (
        <p className="pf-empty">
          No tasks here. Change the filter or add one below.
        </p>
      )}
      {!compact && (
        <form
          className="pf-add-task"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim() || tasks.length >= 30) return;
            setTasks((current) => [
              ...current,
              { id: crypto.randomUUID(), title: title.trim(), status: "todo" },
            ]);
            setTitle("");
            setFilter("all");
            setNotice("Task added.");
          }}
        >
          <label htmlFor="demo-task-title" className="sr-only">
            New task
          </label>
          <input
            id="demo-task-title"
            maxLength={100}
            required
            placeholder="Add a task to the example…"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <button
            type="submit"
            className="pf-button pf-button--green"
            disabled={tasks.length >= 30}
          >
            <Plus size={17} aria-hidden="true" /> Add task
          </button>
        </form>
      )}
      <p className="pf-board-note">
        {storage} {tasks.length >= 30 && "This example supports 30 tasks."}
      </p>
      <p className="sr-only" role="status">
        {notice}
      </p>
    </div>
  );
}
