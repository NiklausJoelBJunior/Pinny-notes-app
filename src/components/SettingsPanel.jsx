import React, { useState } from 'react'
import { Palette, Keyboard, Tag, Plus, X, Sun, Moon, Sliders, Trash2, Download, Check } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useNotes } from '../context/NotesContext'

const SettingsPanel = ({ onClose }) => {
  const { 
    darkMode, 
    toggleTheme, 
    accentColor, 
    setAccentColor, 
    hasOverride, 
    resetToSystemTheme 
  } = useTheme()
  
  const { notes, updateNote, createNewNote } = useNotes()
  
  const [editingTag, setEditingTag] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [isCreatingTag, setIsCreatingTag] = useState(false)
  const [newTagValue, setNewTagValue] = useState('')

  const shortcuts = [
    { label: 'Quick Note', keys: ['ctrl', 'Shift', 'N'] },
    { label: 'Search Notes', keys: ['ctrl', 'F'] },
    { label: 'New Note', keys: ['ctrl', 'N'] },
    { label: 'Save Note', keys: ['ctrl', 'S'] },
    { label: 'Close Note', keys: ['Esc'] },
  ]

  const accentColors = [
    { id: 'terracotta', class: 'bg-[#a13d2d]', name: 'Terracotta' },
    { id: 'sage', class: 'bg-[#4a5d4e]', name: 'Sage' },
    { id: 'teal', class: 'bg-[#1e6b65]', name: 'Teal' },
    { id: 'ochre', class: 'bg-[#b57c1e]', name: 'Ochre' },
    { id: 'cobalt', class: 'bg-[#2b5a84]', name: 'Cobalt' },
    { id: 'plum', class: 'bg-[#884a62]', name: 'Plum' },
  ]

  const getGlobalTags = () => {
    const tagMap = {}
    notes.forEach(note => {
      note.tags?.forEach(tag => {
        const normalized = tag.trim()
        if (normalized) {
          tagMap[normalized] = (tagMap[normalized] || 0) + 1
        }
      })
    })
    
    const variants = ['accent', 'neutral', 'teal-static']
    
    return Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], index) => ({
        name,
        count,
        variant: variants[index % variants.length]
      }))
  }

  const globalTags = getGlobalTags()

  const handleCreateNewTag = async () => {
    const trimmed = newTagValue.trim()
    if (!trimmed) {
      setIsCreatingTag(false)
      return
    }
    
    if (!globalTags.find(t => t.name.toLowerCase() === trimmed.toLowerCase())) {
      await createNewNote(`Tag Index: ${trimmed}`, 'This system note holds your custom tag.', [trimmed])
    }
    
    setNewTagValue('')
    setIsCreatingTag(false)
  }

  const handleGlobalRename = async (oldTag) => {
    const targetValue = renameValue.trim()
    if (!targetValue || targetValue.toLowerCase() === oldTag.toLowerCase()) {
      setEditingTag(null)
      return
    }

    for (const note of notes) {
      if (note.tags?.includes(oldTag)) {
        const updatedTags = note.tags.map(t => t === oldTag ? targetValue : t)
        const uniqueTags = [...new Set(updatedTags)]
        await updateNote(note.id, { tags: uniqueTags })
      }
    }
    setEditingTag(null)
  }

  const handleGlobalDelete = async (tagToDelete) => {
    const confirmPurge = window.confirm(`Permanently delete the tag "${tagToDelete}" from all notes?`)
    if (!confirmPurge) return

    for (const note of notes) {
      if (note.tags?.includes(tagToDelete)) {
        const updatedTags = note.tags.filter(t => t !== tagToDelete)
        await updateNote(note.id, { tags: updatedTags })
      }
    }
    setEditingTag(null)
  }

  const getBadgeStyle = (variant) => {
    switch (variant) {
      case 'accent':
        return 'bg-accent/10 text-accent'
      case 'teal-static':
        return 'bg-teal-100 dark:bg-teal-950/40 text-[#1e6b65] dark:text-teal-400'
      default:
        return 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
    }
  }

  return (
    <div className="w-full h-full bg-vellum-light dark:bg-vellum-dark overflow-y-auto transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-8 py-10 space-y-10">
        
        <div className="flex items-start justify-between border-b border-vellum-light-border dark:border-vellum-dark-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Settings</h1>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1 font-medium">
              Personalize your tactile digital environment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white dark:bg-vellum-dark-surface border border-vellum-light-border dark:border-vellum-dark-border rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center gap-2.5 text-accent font-semibold text-sm mb-6 tracking-wide uppercase transition-colors">
              <Palette size={16} strokeWidth={2.5} />
              <span>Appearance</span>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Interface Theme</span>
                  <div className="flex bg-neutral-100 dark:bg-vellum-dark border border-neutral-200/60 dark:border-neutral-800 rounded-xl p-1 relative">
                    <button 
                      onClick={() => darkMode && toggleTheme()}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        !darkMode 
                          ? 'bg-white text-neutral-800 shadow-xs ring-1 ring-black/5' 
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <Sun size={14} className={!darkMode ? 'text-amber-500' : ''} />
                      Light
                    </button>
                    <button 
                      onClick={() => !darkMode && toggleTheme()}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        darkMode 
                          ? 'bg-neutral-800 text-white shadow-xs' 
                          : 'text-neutral-400 hover:text-neutral-700'
                      }`}
                    >
                      <Moon size={14} className={darkMode ? 'text-indigo-400' : ''} />
                      Dark
                    </button>
                  </div>
                </div>

                <div className="flex justify-end h-4">
                  {hasOverride ? (
                    <button 
                      onClick={resetToSystemTheme}
                      className="text-[11px] font-semibold text-neutral-400 hover:text-accent transition-colors cursor-pointer tracking-wide"
                    >
                      Reset to system appearance preferences
                    </button>
                  ) : (
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium italic select-none">
                      Currently synchronized with your operating system theme.
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 block">Accent Color</span>
                <div className="flex flex-wrap gap-3 items-center">
                  {accentColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setAccentColor(color.id)}
                      title={color.name}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-all duration-150 relative ${color.class} ${
                        accentColor === color.id 
                          ? 'ring-2 ring-offset-2 ring-accent dark:ring-offset-vellum-dark-surface scale-110 shadow-sm' 
                          : 'hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-vellum-dark-surface border border-vellum-light-border dark:border-vellum-dark-border rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center gap-2.5 text-accent font-semibold text-sm mb-6 tracking-wide uppercase transition-colors">
              <Keyboard size={16} strokeWidth={2.5} />
              <span>Global Shortcuts</span>
            </div>
            
            <div className="space-y-4">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.label} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-neutral-600 dark:text-neutral-300">{shortcut.label}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, i) => (
                      <kbd 
                        key={i} 
                        className="bg-neutral-100 dark:bg-vellum-dark border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow-3xs text-neutral-500 dark:text-neutral-400"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-bold text-lg text-neutral-800 dark:text-neutral-100">
              <Tag size={18} className="text-accent transform -rotate-45 transition-colors" />
              <h2>Your Tags</h2>
            </div>
            
            <div className="flex items-center gap-2.5">
              
              
              <button 
                onClick={() => setIsCreatingTag(true)}
                className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-2xs"
              >
                <Plus size={13} strokeWidth={2.5} />
                New Tag
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {globalTags.map((tag) => (
              editingTag === tag.name ? (
                <div key={`edit-${tag.name}`} className="bg-white dark:bg-vellum-dark-surface border border-accent rounded-xl p-3 flex flex-col justify-between h-24 shadow-sm relative animate-fade-in">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold tracking-tight text-neutral-800 dark:text-neutral-100 focus:outline-none border-b border-accent/30 pb-1"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleGlobalRename(tag.name)}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <button 
                      onClick={() => handleGlobalDelete(tag.name)} 
                      className="text-red-400 hover:text-red-500 p-1 hover:bg-red-400/10 rounded cursor-pointer transition-colors"
                      title="Delete Tag"
                    >
                      <Trash2 size={14}/>
                    </button>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setEditingTag(null)} 
                        className="text-neutral-400 hover:text-neutral-600 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer transition-colors"
                      >
                        <X size={14}/>
                      </button>
                      <button 
                        onClick={() => handleGlobalRename(tag.name)} 
                        className="text-emerald-500 hover:text-emerald-600 p-1 hover:bg-emerald-500/10 rounded cursor-pointer transition-colors"
                      >
                        <Check size={14}/>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  key={tag.name} 
                  onClick={() => { setEditingTag(tag.name); setRenameValue(tag.name) }}
                  className="bg-neutral-100/70 dark:bg-vellum-dark-surface border border-neutral-200/40 dark:border-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-xl p-4 transition-all flex flex-col justify-between items-start h-24 shadow-3xs cursor-pointer group"
                >
                  <span className="text-[11px] font-serif font-bold text-neutral-400 group-hover:text-accent transition-colors">#</span>
                  <h3 className="text-sm font-bold tracking-tight text-neutral-700 dark:text-neutral-200 mt-1 leading-none w-full truncate">{tag.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md mt-2 tracking-wide transition-colors ${getBadgeStyle(tag.variant)}`}>
                    {tag.count} {tag.count === 1 ? 'note' : 'notes'}
                  </span>
                </div>
              )
            ))}
            
            {isCreatingTag ? (
              <div className="bg-white dark:bg-vellum-dark-surface border border-accent rounded-xl p-4 flex flex-col justify-between h-24 shadow-sm relative animate-fade-in">
                <input
                  type="text"
                  value={newTagValue}
                  onChange={(e) => setNewTagValue(e.target.value)}
                  placeholder="Tag name..."
                  className="w-full bg-transparent text-sm font-bold tracking-tight text-neutral-800 dark:text-neutral-100 focus:outline-none border-b border-accent/30 pb-1"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateNewTag()}
                />
                <div className="flex justify-end gap-1 mt-2">
                  <button 
                    onClick={() => setIsCreatingTag(false)} 
                    className="text-neutral-400 hover:text-neutral-600 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer transition-colors"
                  >
                    <X size={14}/>
                  </button>
                  <button 
                    onClick={handleCreateNewTag} 
                    className="text-emerald-500 hover:text-emerald-600 p-1 hover:bg-emerald-500/10 rounded cursor-pointer transition-colors"
                  >
                    <Check size={14}/>
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsCreatingTag(true)}
                className="border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 h-24 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-all cursor-pointer group bg-transparent"
              >
                <div className="w-6 h-6 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Plus size={13} />
                </div>
                <span className="text-xs font-semibold tracking-wide">Create new</span>
              </button>
            )}
          </div>
        </div>


      </div>
    </div>
  )
}

export default SettingsPanel