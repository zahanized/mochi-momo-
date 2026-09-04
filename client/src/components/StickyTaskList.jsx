import { useContext, useEffect, useState, useRef } from 'react';
import { TaskContext } from '../context/TaskContext';

const DEFAULT_POSITION = { x: 16, y: 80 }; // matches the old fixed left-4 top-20

function StickyTaskList() {
  const { tasks, fetchTasks } = useContext(TaskContext);
  const [collapsed, setCollapsed] = useState(false);
  const [position, setPosition] = useState(DEFAULT_POSITION);

  const dragInfo = useRef({ startX: 0, startY: 0, originX: 0, originY: 0, moved: false });

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleMouseMove = (e) => {
    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragInfo.current.moved = true;
    }

    const nextX = dragInfo.current.originX + dx;
    const nextY = dragInfo.current.originY + dy;

    // keep it fully on-screen
    const clampedX = Math.max(0, Math.min(nextX, window.innerWidth - 260));
    const clampedY = Math.max(0, Math.min(nextY, window.innerHeight - 40));

    setPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e) => {
    dragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleHeaderClick = () => {
    // Only toggle collapse if the mouse never actually moved — a real
    // click, not a drag that happened to end back where it started.
    if (!dragInfo.current.moved) {
      setCollapsed((c) => !c);
    }
  };

  const remaining = tasks.filter((t) => t.status !== 'done');

  return (
    <div
      className="fixed z-40 w-64 rounded-lg bg-yellow-100 shadow-lg"
      style={{ left: position.x, top: position.y }}
    >
      <div
        className="flex cursor-grab select-none items-center justify-between rounded-t-lg bg-yellow-300 px-3 py-2 active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onClick={handleHeaderClick}
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