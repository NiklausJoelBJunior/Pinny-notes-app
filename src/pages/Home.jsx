import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  RotateCw,
  Moon,
  Sun,
  SlidersHorizontal,
  Pin,
  Zap,
  Trash2,
  X,
  Check,
  Plus,
  Archive,ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotes } from '../context/NotesContext';
import bgImage from '../assets/bg.png';

const Home = ({ currentView }) => {
  const { darkMode, toggleTheme } = useTheme();
  const {
    notes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    createNewNote,
    updateActiveNote,
    deleteNote,
    isLoading,
  } = useNotes();

  const [searchQuery, setSearchQuery] = useState('');
  const [quickCaptureText, setQuickCaptureText] = useState('');
  const [isDraftsOnly, setIsDraftsOnly] = useState(false);
  const [saveNotification, setSaveNotification] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
const searchInputRef = useRef(null)
  const quickCaptureRef = useRef(null)
 useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (activeNote) {
          setSaveNotification(true)
          const timer = setTimeout(() => setSaveNotification(false), 2000)
          return () => clearTimeout(timer)
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        quickCaptureRef.current?.focus()
      }
      
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        createNewNote('', '', [])
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }

      if (e.key === 'Escape') {
        if (activeNoteId) {
          e.preventDefault()
          setActiveNoteId(null)
        } else if (searchQuery) {
          e.preventDefault()
          setSearchQuery('')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeNote, activeNoteId, searchQuery, createNewNote, setActiveNoteId])

  useEffect(() => {
    setIsDraftsOnly(false);
  }, [currentView]);

  const filteredNotes = notes.filter((note) => {
    if (currentView === 'archive') return note.isArchived;
    if (note.isArchived) return false;
    if (isDraftsOnly) {
      return note.tags?.some((tag) => tag.toLowerCase() === 'draft');
    }
    if (currentView === 'pinned') return note.isPinned;
    if (currentView === 'shared') return false;
    return true;
  }).filter((note) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (note.title || '').toLowerCase().includes(query) ||
      (note.content || '').toLowerCase().includes(query) ||
      note.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  // ------ Helper Functions ------
  const getViewTitle = () => {
    if (isDraftsOnly) return 'Draft Documents';
    switch (currentView) {
      case 'pinned':
        return 'Pinned Notes';
      case 'shared':
        return 'Shared Workspaces';
      case 'archive':
        return 'Archived Vellum';
      default:
        return 'Recent Notes';
    }
  };

  const getWordCount = () => {
    if (!activeNote || !activeNote.content) return 0;
    return activeNote.content.trim().split(/\s+/).filter(Boolean).length;
  };

  // ------ Tag Management (first snippet) ------
  const addManualTag = () => {
    if (newTagInput.trim() && activeNote) {
      const cleanTag = newTagInput.replace(/,/g, '').trim();
      const currentTags = activeNote.tags || [];
      if (!currentTags.some((t) => t.toLowerCase() === cleanTag.toLowerCase())) {
        updateActiveNote({ tags: [...currentTags, cleanTag] });
      }
      setNewTagInput('');
    }
  };

  const handleAddTagToNote = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addManualTag();
    }
  };

  // Auto-extract #hashtags from content
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    let payload = { content: newContent };

    const words = newContent.split(/\s+/);
    const hashtags = words
      .filter((w) => w.startsWith('#') && w.length > 1)
      .map((w) => w.slice(1).replace(/[^a-zA-Z0-9-]/g, ''));

    if (hashtags.length > 0) {
      const currentTags = activeNote.tags || [];
      const newTags = [...currentTags];
      let tagsUpdated = false;
      hashtags.forEach((tag) => {
        if (!newTags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
          newTags.push(tag);
          tagsUpdated = true;
        }
      });
      if (tagsUpdated) {
        payload.tags = newTags;
      }
    }
    updateActiveNote(payload);
  };

  const handleRemoveTagFromNote = (tagToRemove) => {
    if (!activeNote) return;
    const updatedTags = (activeNote.tags || []).filter((t) => t !== tagToRemove);
    updateActiveNote({ tags: updatedTags });
  };

  const handleArchiveToggle = () => {
    if (!activeNote) return;
    updateActiveNote({ isArchived: !activeNote.isArchived });
  };

  const allAvailableTags = Array.from(
    new Set(notes.flatMap((n) => n.tags || [])),
  ).filter((tag) => !activeNote?.tags?.includes(tag));

  // ------ Render ------
  return (
    <div className="w-full h-full flex divide-x divide-vellum-light-border dark:divide-vellum-dark-border animate-fade-in">
      {/* Sidebar */}
      <div className="w-80 h-full flex flex-col bg-vellum-light/50 dark:bg-vellum-dark/30 shrink-0">
        <div className="p-4 flex items-center justify-between border-b border-vellum-light-border dark:border-vellum-dark-border">
          <div className="flex gap-4 text-sm font-medium">
            <button
              onClick={() => setIsDraftsOnly(true)}
              className={`cursor-pointer transition-colors pb-1 border-b-2 text-xs font-bold uppercase tracking-wider ${
                isDraftsOnly
                  ? 'text-accent border-accent'
                  : 'text-neutral-400 dark:text-neutral-500 border-transparent hover:text-neutral-600'
              }`}
            >
              Drafts
            </button>
            <button
              onClick={() => setIsDraftsOnly(false)}
              className={`cursor-pointer capitalize transition-colors pb-1 border-b-2 text-xs font-bold uppercase tracking-wider ${
                !isDraftsOnly
                  ? 'text-accent border-accent'
                  : 'text-neutral-400 dark:text-neutral-500 border-transparent hover:text-neutral-600'
              }`}
            >
              {currentView.replace('-', ' ')}
            </button>
          </div>
          <button className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer">
            <SlidersHorizontal size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-xs font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 px-2 uppercase py-1">
            {getViewTitle()}
          </div>

          {isLoading ? (
            <div className="text-xs text-center text-neutral-400 dark:text-neutral-500 py-8 font-medium">
              Reading local records...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-xs text-center text-neutral-400 dark:text-neutral-500 py-8 font-medium">
              No notes found here.
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`p-4 border transition-all cursor-pointer group relative ${
                  note.id === activeNoteId
                    ? 'bg-white dark:bg-vellum-dark-surface border-vellum-light-border dark:border-vellum-dark-border shadow-xs ring-1 ring-accent/20'
                    : note.tags?.length > 0
                    ? 'bg-transparent border-transparent border-l-2 border-l-accent/50 hover:bg-neutral-100 dark:hover:bg-white/5'
                    : 'bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className="font-semibold text-sm tracking-tight text-neutral-800 dark:text-neutral-100 truncate pr-4">
                    {note.title || 'Untitled Note'}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {note.isPinned && (
                      <Pin size={13} className="text-accent transform rotate-45" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 line-clamp-2 mb-3 leading-relaxed">
                  {note.content || 'No additional text...'}
                </p>
                <div className="flex flex-wrap gap-1.5 items-center justify-between">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {note.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] tracking-wider font-bold px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity p-0.5 rounded cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 h-full flex flex-col justify-between bg-white dark:bg-vellum-dark">
        {/* Header */}
        <div className="h-14 px-6 border-b border-vellum-light-border dark:border-vellum-dark-border flex items-center justify-between shrink-0">
          <div className="relative w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
            ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, contents or tags..."
              className="w-full bg-neutral-100 dark:bg-vellum-dark-surface text-xs rounded-lg pl-9 pr-3 py-1.5 focus:outline-none text-neutral-700 dark:text-neutral-300 border border-transparent focus:border-vellum-light-border dark:focus:border-vellum-dark-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-neutral-400 dark:text-neutral-500">
            {activeNote && (
              <span className="text-[11px] font-medium tracking-wide text-neutral-400 dark:text-neutral-500">
                {getWordCount()} words
              </span>
            )}
            <button
              onClick={toggleTheme}
              className="hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer transition-colors"
            >
              {darkMode ? (
                <Sun size={16} className="text-amber-500" />
              ) : (
                <Moon size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Note Editor */}
        {activeNote ? (
          <div className="flex-1 flex flex-col px-12 py-8 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => updateActiveNote({ title: e.target.value })}
                placeholder="Untitled Note"
                className="w-full bg-transparent text-3xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100 focus:outline-none border-none p-0 placeholder-neutral-300 dark:placeholder-neutral-700"
              />
              <div className="flex items-center gap-2">
                {/* Archive Toggle (first snippet) */}
                <button
                  onClick={handleArchiveToggle}
                  className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                    activeNote.isArchived
                      ? 'bg-amber-100 text-amber-700 border-amber-200'
                      : 'border-transparent text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  title={activeNote.isArchived ? 'Unarchive Note' : 'Archive Note'}
                >
                  <Archive size={16} />
                </button>
                <button 
  onClick={() => {
  if (window.electronAPI) {
    window.electronAPI.popOutNote(activeNote)
  } else {
    console.warn("Pop-out feature requires the desktop environment.")
  }
}}
  className="p-2 rounded-xl transition-colors cursor-pointer border border-transparent text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
  title="Pop out to Desktop"
>
  <ExternalLink size={16} />
</button>
                {/* Pin Toggle */}
                <button
                  onClick={() =>
                    updateActiveNote({ isPinned: !activeNote.isPinned })
                  }
                  className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                    activeNote.isPinned
                      ? 'bg-accent/10 border-accent/20 text-accent'
                      : 'border-transparent text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  title={activeNote.isPinned ? 'Unpin Note' : 'Pin Note'}
                >
                  <Pin
                    size={16}
                    className={activeNote.isPinned ? 'transform rotate-45' : ''}
                  />
                </button>
                {/* Close Button */}
                <button
                  onClick={() => setActiveNoteId(null)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 border border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
                  title="Close Workspace"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tag Editor (first snippet) */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800/40">
              {activeNote.tags?.map((tag) => (
                <div
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="flex items-center gap-1 text-[10px] tracking-wider font-bold px-2 py-1 rounded bg-accent/10 border border-accent/20 text-accent uppercase select-none hover:bg-accent/20 transition-all cursor-pointer"
                >
                  <span>{tag}</span>
                  <X
                    size={10}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTagFromNote(tag);
                    }}
                    className="hover:text-red-500 p-0.5 rounded-full"
                  />
                </div>
              ))}

              <div className="flex items-center bg-neutral-50 dark:bg-neutral-800/30 pl-2 pr-1 py-0.5 rounded border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 focus-within:border-accent">
                <button
                  onClick={addManualTag}
                  className="mr-1 text-neutral-400 hover:text-accent cursor-pointer transition-colors"
                >
                  <Plus size={10} />
                </button>

                <datalist id="available-tags">
                  {allAvailableTags.map((tag) => (
                    <option key={tag} value={tag} />
                  ))}
                </datalist>

                <input
                  type="text"
                  list="available-tags"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTagToNote}
                  onBlur={addManualTag}
                  placeholder="New Tag..."
                  className="bg-transparent text-[10px] font-medium focus:outline-none w-20 uppercase placeholder-neutral-400 dark:placeholder-neutral-600 text-neutral-700 dark:text-neutral-300"
                />
              </div>
            </div>

            {/* Content area with hashtag detection */}
            <textarea
              value={activeNote.content}
              onChange={handleContentChange}
              placeholder="Start writing... (Type #tagname to automatically create tags!)"
              className="w-full flex-1 bg-transparent text-base leading-relaxed text-neutral-600 dark:text-neutral-300 focus:outline-none border-none p-0 resize-none placeholder-neutral-300 dark:placeholder-neutral-700 font-serif"
            />
          </div>
        ) : (
          // Empty State (second snippet)
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
            <div className="w-60 h-60 relative flex items-center justify-center overflow-hidden shadow-xs">
              <img
                src={bgImage}
                alt="Vellum Background"
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              />
            </div>

            <h2 className="text-xl font-bold tracking-tight text-neutral-800 dark:text-neutral-200 mb-2">
              Your digital vellum awaits
            </h2>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 leading-relaxed mb-6">
              Select a note from the sidebar or click below to spin up an empty
              scratchpad canvas.
            </p>
            <button
              onClick={() => createNewNote('', '', [])}
              className="bg-neutral-100 dark:bg-vellum-dark-surface border border-vellum-light-border dark:border-vellum-dark-border hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-2xs cursor-pointer"
            >
              New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;