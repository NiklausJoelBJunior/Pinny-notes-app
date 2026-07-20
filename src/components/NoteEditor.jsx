import React from 'react'
import { useNotes } from '../context/NotesContext'

const NoteEditor = () => {
  const { activeNote, updateActiveNote } = useNotes()

  if (!activeNote) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 font-medium font-serif">
        <p>No active note selected.</p>
      </div>
    )
  }

  const wordCount = activeNote.content ? activeNote.content.trim().split(/\s+/).filter(Boolean).length : 0
  const readingTime = Math.ceil(wordCount / 200) 

  return (
    <div className="w-full h-full flex bg-transparent">
      {/* Writing Pad Column */}
      <div className="flex-1 flex flex-col px-12 py-10 space-y-6 overflow-y-auto">
        {/* Title Field Input */}
        <input 
          type="text"
          value={activeNote.title}
          onChange={(e) => updateActiveNote({ title: e.target.value })}
          placeholder="Title..."
          className="w-full bg-transparent text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 focus:outline-hidden border-none p-0 placeholder-neutral-200 dark:placeholder-neutral-800"
        />

        {/* Content Body TextArea */}
        <textarea
          value={activeNote.content}
          onChange={(e) => updateActiveNote({ content: e.target.value })}
          placeholder="Start writing your thoughts..."
          className="w-full flex-1 bg-transparent text-base leading-relaxed text-neutral-700 dark:text-neutral-300 focus:outline-hidden border-none p-0 resize-none placeholder-neutral-300 dark:placeholder-neutral-700 font-serif"
        />
      </div>

      {/* Sidebar Metadata Detail Column */}
      <div className="w-56 border-l border-vellum-light-border dark:border-vellum-dark-border p-6 space-y-6 text-xs select-none">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase block mb-1">Word Count</span>
          <span className="text-xl font-serif font-bold text-neutral-800 dark:text-neutral-200">{wordCount}</span>
        </div>

        <div>
          <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase block mb-1">Reading Time</span>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {wordCount > 0 ? `${readingTime} min` : '-- min'}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase block mb-2">Tags</span>
          <div className="flex flex-wrap gap-1.5">
            {activeNote.tags?.map(tag => (
              <span 
                key={tag}
                className="bg-accent/10 text-accent font-semibold px-2.5 py-0.5 rounded-md text-[10px] capitalize tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoteEditor