import { useContext, useEffect, useState } from 'react';
import { TaskContext } from '../context/TaskContext';

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

function KanbanBoard() {
  const { tasks, fetchTasks, addTask, updateTaskStatus, deleteTask } =
    useContext(TaskContext);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addTask(title, '');
    setTitle('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        Mochi Momo Board
      </h1>

      <form onSubmit={handleAdd} className="mb-8 flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task title..."
          className="flex-1 rounded border border-gray-300 p-2"
        />
        <button
          type="submit"
          className="rounded bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700"
        >
          Add Task
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col.key} className="rounded-lg bg-white p-4 shadow">
            <h2 className="mb-4 font-semibold text-gray-700">{col.label}</h2>
            <div className="space-y-3">
              {tasks
                .filter((t) => t.status === col.key)
                .map((task) => (
                  <div
                    key={task._id}
                    className="rounded border border-gray-200 p-3"
                  >
                    <p className="mb-2 font-medium text-gray-800">
                      {task.title}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {COLUMNS.filter((c) => c.key !== task.status).map(
                        (c) => (
                          <button
                            key={c.key}
                            onClick={() => updateTaskStatus(task._id, c.key)}
                            className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
                          >
                            Move to {c.label}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => deleteTask(task._id)}
                        className="rounded bg-red-100 px-2 py-1 text-xs text-red-600 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KanbanBoard;