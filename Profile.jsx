import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { Camera, BookOpen, CheckSquare, Calendar, Edit2, LogOut, Check, X } from 'lucide-react';

const Profile = () => {
  const { user, apiStr, updateAuthUser, logout } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalNotes: 0, completedTasks: 0, attendancePercent: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    college: '',
    branch: '',
    year: '',
    profileImage: ''
  });
  const [file, setFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const fetchProfileInfo = async () => {
    try {
      const res = await axios.get(`${apiStr}/user/profile`, { 
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      const fetchedUser = res.data.user;
      setProfileData({
        name: fetchedUser.name || '',
        college: fetchedUser.college || '',
        branch: fetchedUser.branch || '',
        year: fetchedUser.year || '',
        profileImage: fetchedUser.profileImage || ''
      });
      setStats(res.data.stats);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile", err);
    }
  };

  useEffect(() => {
    fetchProfileInfo();
  }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('college', profileData.college);
      formData.append('branch', profileData.branch);
      formData.append('year', profileData.year);
      if (file) formData.append('profileImage', file);

      const res = await axios.put(`${apiStr}/user/profile`, formData, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update local storage so sidebar matches instantly
      updateAuthUser({
        name: res.data.name,
        profileImage: res.data.profileImage
      });
      
      setProfileData(prev => ({ ...prev, profileImage: res.data.profileImage }));
      setIsEditing(false);
      setFile(null);
      setPreviewFile(null);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  if (loading) return <div className="text-gray-500">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Profile Card */}
      <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl"></div>
        
        {/* Profile Avatar */}
        <div className="relative group shrink-0">
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex flex-col justify-center items-center relative z-10">
            {previewFile ? (
              <img src={previewFile} alt="Preview" className="w-full h-full object-cover" />
            ) : profileData.profileImage ? (
              <img src={`${apiStr.replace('/api', '')}${profileData.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-gray-400">{profileData.name.charAt(0)}</span>
            )}

            {isEditing && (
              <label className="absolute inset-0 bg-black/50 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={28} />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </div>
        </div>

        {/* User Info & Edit Form */}
        <div className="flex-1 w-full relative z-10 text-center md:text-left">
          {!isEditing ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{profileData.name}</h1>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">{user.email}</p>
                </div>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold transition-colors"
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">College/University</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{profileData.college || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Branch/Major</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{profileData.branch || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Year/Semester</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{profileData.year || '—'}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEditSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white mb-4 flex justify-between items-center">
                Edit Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Full Name</label>
                  <input required value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">College/University</label>
                  <input placeholder="e.g. Stanford University" value={profileData.college} onChange={e => setProfileData({...profileData, college: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Branch/Major</label>
                  <input placeholder="e.g. Computer Science" value={profileData.branch} onChange={e => setProfileData({...profileData, branch: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Year/Semester</label>
                  <input placeholder="e.g. 3rd Year" value={profileData.year} onChange={e => setProfileData({...profileData, year: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 mt-4 border-t dark:border-gray-700">
                <button type="button" onClick={() => { setIsEditing(false); setPreviewFile(null); fetchProfileInfo()}} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  <X size={16} /> Cancel
                </button>
                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-semibold shadow-md shadow-brand-blue/20">
                  <Check size={16} /> Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Dashboard Summary Setup */}
      <div>
        <h3 className="text-xl font-bold dark:text-white mb-4 ml-1">Your Academic Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl flex items-center gap-5 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center">
              <BookOpen size={28} className="text-blue-500" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Uploaded Notes</p>
              <p className="text-3xl font-bold dark:text-white">{stats.totalNotes}</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center gap-5 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-full bg-brand-green/10 flex items-center justify-center">
              <CheckSquare size={28} className="text-brand-green" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Tasks Completed</p>
              <p className="text-3xl font-bold dark:text-white">{stats.completedTasks}</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center gap-5 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-full bg-brand-purple/10 flex items-center justify-center">
              <Calendar size={28} className="text-brand-purple" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Overall Attendance</p>
              <p className="text-3xl font-bold dark:text-white">{stats.attendancePercent}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
