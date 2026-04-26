import { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { Plus, Search, Trash2, FileText, Download } from 'lucide-react';

const Notes = () => {
  const { user, apiStr } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', subject: '', description: '' });
  const [file, setFile] = useState(null);

  const fetchNotes = async () => {
    const res = await axios.get(`${apiStr}/notes`, { headers: { Authorization: `Bearer ${user.token}` } });
    setNotes(res.data);
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('subject', formData.subject);
    data.append('description', formData.description);
    if (file) data.append('file', file);

    await axios.post(`${apiStr}/notes`, data, { 
      headers: { 
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'multipart/form-data'
      } 
    });
    setShowModal(false);
    setFormData({ title: '', subject: '', description: '' });
    setFile(null);
    fetchNotes();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${apiStr}/notes/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
    fetchNotes();
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Notes</h1>
          <p className="text-gray-500 mt-2">Organize and find your study materials easily.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-brand-green/30 hover:scale-105 transition-all">
          <Plus size={20} /> New Note
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by title or subject..." 
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-green outline-none dark:text-white shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map(note => (
          <div key={note._id} className="glass-panel rounded-2xl p-6 group hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-semibold rounded-full border border-brand-blue/20">
                {note.subject}
              </span>
              <button onClick={() => handleDelete(note._id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={18} />
              </button>
            </div>
            <h3 className="text-lg font-bold dark:text-white mb-2">{note.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">{note.description}</p>
            {note.filePath && (
              <a href={`${apiStr.replace('/api', '')}${note.filePath}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-600 group/link">
                <FileText size={16} className="text-brand-blue" />
                <span className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1">{note.fileName}</span>
                <Download size={14} className="text-gray-400 group-hover/link:text-brand-blue transition-colors" />
              </a>
            )}
            <p className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold dark:text-white mb-6">Create Note</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input required type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="px-4 py-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green outline-none" />
              <input required type="text" placeholder="Subject" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="px-4 py-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green outline-none" />
              <textarea required rows={4} placeholder="Content" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="px-4 py-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green outline-none"></textarea>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Attach File (Optional)</label>
                <input type="file" onChange={e => setFile(e.target.files[0])} className="text-sm dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-green/10 file:text-brand-green hover:file:bg-brand-green/20 transition-colors" />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-brand-green text-white font-semibold shadow-md shadow-brand-green/20">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
