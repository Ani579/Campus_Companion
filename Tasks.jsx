import { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { Plus, CheckCircle, Circle, Trash2, AlertCircle } from 'lucide-react';

const Tasks = () => {
  const { user, apiStr } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', subject: '', deadline: '' });

  const fetchTasks = async () => {
    const res = await axios.get(`${apiStr}/tasks`, { headers: { Authorization: `Bearer ${user.token}` } });
    setTasks(res.data);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${apiStr}/tasks`, formData, { headers: { Authorization: `Bearer ${user.token}` } });
    setShowModal(false);
    setFormData({ title: '', subject: '', deadline: '' });
    fetchTasks();
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await axios.put(`${apiStr}/tasks/${task._id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${user.token}` } });
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${apiStr}/tasks/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
    fetchTasks();
  };

  const isOverdue = (deadline) => new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Tracker</h1>
          <p className="text-gray-500 mt-2">Manage your assignments and deadlines.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-brand-orange text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-brand-orange/30 hover:scale-105 transition-all">
          <Plus size={20} /> Add Task
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {tasks.length === 0 ? (
           <p className="p-8 text-center text-gray-500">No tasks found. Add a new task!</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {tasks.map(task => (
              <div key={task._id} className={`p-4 flex items-center justify-between transition-colors ${task.status === 'completed' ? 'bg-gray-50 dark:bg-gray-800/50 opacity-75' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleStatus(task)} className="text-brand-orange hover:text-orange-600 transition-colors">
                    {task.status === 'completed' ? <CheckCircle size={24} /> : <Circle size={24} />}
                  </button>
                  <div>
                    <h3 className={`font-semibold dark:text-white ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {task.subject}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${isOverdue(task.deadline) && task.status !== 'completed' ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                        {isOverdue(task.deadline) && task.status !== 'completed' && <AlertCircle size={12} />}
                        {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(task._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold dark:text-white mb-6">Create Task</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input required type="text" placeholder="Task Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="px-4 py-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
              <input required type="text" placeholder="Subject" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="px-4 py-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
              <input required type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="px-4 py-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-brand-orange text-white font-semibold shadow-md shadow-brand-orange/20">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
