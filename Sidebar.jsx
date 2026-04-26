import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, CheckSquare, Calendar, Bot, LogOut, User as UserIcon } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

const Sidebar = () => {
  const { logout, user, apiStr } = useContext(AuthContext);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Notes', path: '/notes', icon: <BookOpen size={20} /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare size={20} /> },
    { name: 'Attendance', path: '/attendance', icon: <Calendar size={20} /> },
    { name: 'AI Assistant', path: '/ai', icon: <Bot size={20} /> },
    { name: 'Profile', path: '/profile', icon: <UserIcon size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed flex flex-col justify-between shadow-lg z-10 transition-colors duration-300">
      <div>
        <div className="p-6 flex items-center justify-center border-b border-gray-100 dark:border-gray-700">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-dark to-brand-blue flex items-center gap-3">
            <img src="/logo.jpg" alt="Campus Companion Logo" className="w-10 h-10 object-contain rounded-full border-2 border-brand-blue shadow-md" />
            Campus
            <br/>Companion
          </h1>
        </div>
        <nav className="mt-6 flex flex-col gap-2 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-blue/10 text-brand-blue font-semibold scale-[1.02] shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-brand-blue'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => document.documentElement.classList.toggle('dark')}
          className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 rounded-xl transition-all mb-2"
        >
          <span className="dark:hidden flex items-center gap-2">🌙 Dark Mode</span>
          <span className="hidden dark:flex items-center gap-2">☀️ Light Mode</span>
        </button>

        <NavLink to="/profile" className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 hover:dark:bg-gray-700 transition-colors">
          {user?.profileImage ? (
             <img src={`${apiStr.replace('/api', '')}${user.profileImage}`} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="flex-1 truncate text-sm">
            <p className="font-semibold dark:text-white">{user?.name}</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{user?.email}</p>
          </div>
        </NavLink>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
