import { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const Attendance = () => {
  const { user, apiStr } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ subject: '', attendedClasses: 0, totalClasses: 0 });

  const fetchData = async () => {
    const res = await axios.get(`${apiStr}/attendance`, { headers: { Authorization: `Bearer ${user.token}` } });
    setData(res.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${apiStr}/attendance`, formData, { headers: { Authorization: `Bearer ${user.token}` } });
    setShowModal(false);
    setFormData({ subject: '', attendedClasses: 0, totalClasses: 0 });
    fetchData();
  };

  const updateAttendance = async (id, attended, total) => {
    await axios.put(`${apiStr}/attendance/${id}`, { attendedClasses: attended, totalClasses: total }, { headers: { Authorization: `Bearer ${user.token}` } });
    fetchData();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${apiStr}/attendance/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
    fetchData();
  };

  const getPercentage = (attended, total) => total === 0 ? 0 : Math.round((attended / total) * 100);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendance Tracker</h1>
          <p className="text-gray-500 mt-2">Monitor your class attendance and stay above 75%.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-brand-purple text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-brand-purple/30 hover:scale-105 transition-all">
          <Plus size={20} /> Add Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map(item => {
          const percent = getPercentage(item.attendedClasses, item.totalClasses);
          const isDanger = percent < 75 && item.totalClasses > 0;
          return (
            <div key={item._id} className="glass-panel rounded-2xl p-6 relative overflow-hidden">
              {isDanger && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-bl-full flex justify-end items-start p-2"><TrendingDown size={20} className="text-red-500" /></div>}
              {!isDanger && item.totalClasses > 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full flex justify-end items-start p-2"><TrendingUp size={20} className="text-green-500" /></div>}
              
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold dark:text-white">{item.subject}</h3>
                <button onClick={() => handleDelete(item._id)} className="text-gray-400 hover:text-red-500 z-10"><Trash2 size={18} /></button>
              </div>

               <div className="flex items-end gap-2 mb-4">
                  <span className={`text-4xl font-bold ${isDanger ? 'text-red-500' : 'text-brand-purple'}`}>{percent}%</span>
                  <span className="text-gray-500 mb-1">attendance</span>
               </div>

              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 mb-6 overflow-hidden">
                <div className={`h-2.5 rounded-full ${isDanger ? 'bg-red-500' : 'bg-brand-purple'}`} style={{ width: `${percent}%` }}></div>
              </div>

              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-500 mb-1">Attended</p>
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => updateAttendance(item._id, Math.max(0, item.attendedClasses - 1), item.totalClasses)} className="w-6 h-6 rounded bg-white dark:bg-gray-700 shadow flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600">-</button>
                    <span className="font-semibold dark:text-white w-6">{item.attendedClasses}</span>
                    <button onClick={() => updateAttendance(item._id, item.attendedClasses + 1, item.totalClasses)} className="w-6 h-6 rounded bg-white dark:bg-gray-700 shadow flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600">+</button>
                  </div>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:bg-gray-600"></div>
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-500 mb-1">Total</p>
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => updateAttendance(item._id, item.attendedClasses, Math.max(0, item.totalClasses - 1))} className="w-6 h-6 rounded bg-white dark:bg-gray-700 shadow flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600">-</button>
                    <span className="font-semibold dark:text-white w-6">{item.totalClasses}</span>
                    <button onClick={() => updateAttendance(item._id, item.attendedClasses, item.totalClasses + 1)} className="w-6 h-6 rounded bg-white dark:bg-gray-700 shadow flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600">+</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold dark:text-white mb-6">Add Subject</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input required type="text" placeholder="Subject Name" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="px-4 py-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-brand-purple outline-none" />
              <div className="flex gap-4">
                <div className="w-1/2 flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Classes Attended</label>
                  <input required min="0" type="number" placeholder="Attended" value={formData.attendedClasses} onChange={e => setFormData({...formData, attendedClasses: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-brand-purple outline-none" />
                </div>
                <div className="w-1/2 flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Classes</label>
                  <input required min="0" type="number" placeholder="Total" value={formData.totalClasses} onChange={e => setFormData({...formData, totalClasses: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-brand-purple outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-brand-purple text-white font-semibold shadow-md shadow-brand-purple/20">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
