import { useContext, useEffect, useState } from 'react';
import { TaskContext } from '../context/TaskContext';

function StickyTaskList() {
  const { tasks, fetchTasks } = useContext(TaskContext);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const remaining = tasks.filter((t) => t.status !== 'done');

  return (
    <div className="fixed left-4 top-20 z-40 w-64 rounded-lg bg-yellow-100 shadow-lg">
      <div
        className="flex cursor-pointer items-center justify-between rounded-t-lg bg-yellow-300 px-3 py-2"
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className="text-sm font-semibold text-yellow-900">
          To Do ({remaining.length})
        </span>
        <span className="text-yellow-900">{collapsed ? '+' : '−'}</span>
      </div>
      {!collapsed && (
        <ul className="max-h-64 overflow-y-auto p-3 text-sm text-yellow-900">
          {remaining.length === 0 ? (
            <li className="italic text-yellow-700">Nothing left — nice work!</li>
          ) : (
            remaining.map((t) => (
              <li key={t._id} className="mb-1 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    t.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                />
                {t.title}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default StickyTaskList;