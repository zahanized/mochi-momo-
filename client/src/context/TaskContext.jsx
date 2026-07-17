import { createContext, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/tasks', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const addTask = async (title, description) => {
    const res = await fetch('http://localhost:5001/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ title, description }),
    });
    const newTask = await res.json();
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTaskStatus = async (id, status) => {
    const res = await fetch(`http://localhost:5001/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ status }),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  const deleteTask = async (id) => {
    await fetch(`http://localhost:5001/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <TaskContext.Provider
      value={{ tasks, fetchTasks, addTask, updateTaskStatus, deleteTask }}
    >
      {children}
    </TaskContext.Provider>
  );
};