import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useNotes } from '../context/NotesContext'
import { X } from 'lucide-react'

const StickyView = () => {
  const { id } = useParams()
  const { notes, updateNote } = useNotes()
  const [localNote, setLocalNote] = useState(null)

  useEffect(() => {
    const foundNote = notes.find(n => n.id === id)
    if (foundNote) setLocalNote(foundNote)
  }, [id, notes])

  if (!localNote) return null

  return (
    <div className="w-full h-screen bg-vellum-light dark:bg-vellum-dark border border-vellum-light-border dark:border-vellum-dark-border rounded-xl flex flex-col overflow-hidden shadow-2xl">
      
      <div 
        className="h-8 bg-vellum-light-surface dark:bg-vellum-dark-surface border-b border-vellum-light-border dark:border-vellum-dark-border flex items-center justify-between px-3 shrink-0"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200 truncate pr-2">
          {localNote.title || 'Pinned Note'}
        </span>
        
        <button 
          onClick={() => window.close()} 
          className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer p-1 transition-colors"
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <textarea
          value={localNote.content || ''}
          onChange={(e) => {
            setLocalNote({ ...localNote, content: e.target.value })
            updateNote(id, { content: e.target.value })
          }}
          placeholder="Write something..."
          className="w-full h-full bg-transparent resize-none focus:outline-none text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400"
          style={{ WebkitAppRegion: 'no-drag' }}
        />
      </div>
    </div>
  )
}

export default StickyView