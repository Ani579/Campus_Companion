import { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { BookOpen, CheckSquare, Calendar, Bot, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, apiStr } = useContext(AuthContext);
  const [stats, setStats] = useState({ tasks: 0, notes: 0, attendanceWarning: 0 });
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [tasksRes, notesRes, attRes] = await Promise.all([
          axios.get(`${apiStr}/tasks`, config),
          axios.get(`${apiStr}/notes`, config),
          axios.get(`${apiStr}/attendance`, config),
        ]);

        const pendingTasks = tasksRes.data.filter(t => t.status === 'pending');
        const lowAttendance = attRes.data.filter(a => ((a.attendedClasses / a.totalClasses) * 100) < 75);

        setStats({
          tasks: pendingTasks.length,
          notes: notesRes.data.length,
          attendanceWarning: lowAttendance.length
        });
        setRecentTasks(pendingTasks.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };
    fetchStats();
  }, [apiStr, user]);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500 mt-2">Here's what's happening with your studies today.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600 dark:text-gray-300">Pending Tasks</h3>
            <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
              <CheckSquare size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold dark:text-white">{stats.tasks}</p>
        </div>
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600 dark:text-gray-300">Total Notes</h3>
            <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
              <BookOpen size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold dark:text-white">{stats.notes}</p>
        </div>
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between border-[1px] border-red-500/30 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-red-600 dark:text-red-400">Low Attendance</h3>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
              <Calendar size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.attendanceWarning} subjects</p>
        </div>
        <Link to="/ai" className="glass-panel rounded-2xl p-6 flex flex-col justify-between bg-gradient-to-br from-brand-blue to-brand-purple text-white relative overflow-hidden hover:scale-[1.02] transition-transform">
           <div className="absolute top-0 right-0 p-4 opacity-50"><Bot size={64}/></div>
           <h3 className="font-semibold z-10 text-xl">Ask AI Assistant</h3>
           <p className="z-10 mt-2 text-white/80 text-sm">Need help studying?</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">Upcoming Deadlines</h2>
            <Link to="/tasks" className="text-brand-blue text-sm font-medium hover:underline">View All</Link>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending tasks! 🎉</p>
          ) : (
            <div className="flex flex-col gap-4">
              {recentTasks.map(task => (
                <div key={task._id} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold dark:text-white">{task.title}</h4>
                    <p className="text-sm text-gray-500">{new Date(task.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
            <div className="w-24 h-24 bg-brand-lightBlue/10 rounded-full flex items-center justify-center mb-4">
              <Bot size={48} className="text-brand-lightBlue" />
            </div>
            <h2 className="text-xl font-bold dark:text-white mb-2">Study Smarter</h2>
            <p className="text-gray-500 mb-6 max-w-sm">Use the AI Assistant to generate summaries, solve problems, or explain complex concepts instantly.</p>
            <Link to="/ai" className="bg-brand-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-dark transition-colors">
              Chat with AI
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
