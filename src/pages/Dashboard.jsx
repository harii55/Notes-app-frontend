import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Pin, 
  Archive, 
  Edit3, 
  Trash2, 
  Share2,
  X,
  Check,
  PinOff,
  ArchiveX
} from 'lucide-react';
import { notesAPI, shareAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, pinned, archived
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', body: '', tags: [] });
  const [newTag, setNewTag] = useState('');

  const { logout } = useAuth();

  useEffect(() => {
    fetchNotes();
  }, [filter]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Handle different filter states
      if (filter === 'pinned') {
        params.pinned = true;
        // Don't include archived notes in pinned view
        params.archived = false;
      } else if (filter === 'archived') {
        params.archived = true;
      } else {
        // 'all' filter - explicitly exclude archived notes
        params.archived = false;
      }
      
      const response = await notesAPI.getNotes(params);
      setNotes(response.data.items);
    } catch (error) {
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const response = await notesAPI.createNote(newNote);
      setNotes([response.data, ...notes]);
      setNewNote({ title: '', body: '', tags: [] });
      setIsCreating(false);
      toast.success('Note created successfully');
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const response = await notesAPI.updateNote(editingNote.id, {
        title: editingNote.title,
        body: editingNote.body,
        tags: editingNote.tags,
      });
      
      setNotes(notes.map(note => 
        note.id === editingNote.id ? response.data : note
      ));
      setEditingNote(null);
      toast.success('Note updated successfully');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesAPI.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handlePinNote = async (noteId, pinned) => {
    try {
      if (pinned) {
        await notesAPI.unpinNote(noteId);
      } else {
        await notesAPI.pinNote(noteId);
      }
      fetchNotes();
      toast.success(pinned ? 'Note unpinned' : 'Note pinned');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleArchiveNote = async (noteId, archived) => {
    try {
      if (archived) {
        await notesAPI.unarchiveNote(noteId);
      } else {
        await notesAPI.archiveNote(noteId);
      }
      fetchNotes();
      toast.success(archived ? 'Note unarchived' : 'Note archived');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleShareNote = async (noteId) => {
    try {
      const response = await shareAPI.createShareLink(noteId);
      navigator.clipboard.writeText(response.data.url);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to create share link');
    }
  };

  const addTag = (noteData, setNoteData) => {
    if (newTag.trim() && !noteData.tags.includes(newTag.trim())) {
      setNoteData({
        ...noteData,
        tags: [...noteData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove, noteData, setNoteData) => {
    setNoteData({
      ...noteData,
      tags: noteData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Active Notes</option>
              <option value="pinned">Pinned Notes</option>
              <option value="archived">Archived Notes</option>
            </select>
            
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4" />
              New Note
            </button>
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate flex-1">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-1 ml-2">
                      {note.pinned && <Pin className="h-4 w-4 text-blue-500" />}
                      {note.archivedAt && <Archive className="h-4 w-4 text-gray-500" />}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {note.body || 'No content'}
                  </p>
                  
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Updated {formatDate(note.updatedAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingNote(note)}
                      className="p-1 text-gray-400 hover:text-blue-500"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handlePinNote(note.id, note.pinned)}
                      className="p-1 text-gray-400 hover:text-blue-500"
                      title={note.pinned ? "Unpin" : "Pin"}
                    >
                      {note.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleArchiveNote(note.id, !!note.archivedAt)}
                      className="p-1 text-gray-400 hover:text-yellow-500"
                      title={note.archivedAt ? "Unarchive" : "Archive"}
                    >
                      {note.archivedAt ? <ArchiveX className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleShareNote(note.id)}
                      className="p-1 text-gray-400 hover:text-green-500"
                      title="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredNotes.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No notes found. Create your first note!</p>
          </div>
        )}
      </div>

      {/* Create Note Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Create New Note</h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Note title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
                
                <textarea
                  placeholder="Write your note here..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newNote.body}
                  onChange={(e) => setNewNote({ ...newNote, body: e.target.value })}
                />
                
                <div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add a tag"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag(newNote, setNewNote)}
                    />
                    <button
                      onClick={() => addTag(newNote, setNewNote)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                  
                  {newNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newNote.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag, newNote, setNewNote)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateNote}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Check className="h-4 w-4" />
                  Create Note
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Edit Note</h2>
                <button
                  onClick={() => setEditingNote(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Note title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                />
                
                <textarea
                  placeholder="Write your note here..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingNote.body}
                  onChange={(e) => setEditingNote({ ...editingNote, body: e.target.value })}
                />
                
                <div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add a tag"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag(editingNote, setEditingNote)}
                    />
                    <button
                      onClick={() => addTag(editingNote, setEditingNote)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                  
                  {editingNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {editingNote.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag, editingNote, setEditingNote)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdateNote}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Check className="h-4 w-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;