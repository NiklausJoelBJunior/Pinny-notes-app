import React, { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const QuickCapture = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const titleRef = useRef(null)

  useEffect(() => {
    titleRef.current?.focus()

    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        window.electronAPI.closeQuickCapture()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  const handleSave = async () => {
    if (title.trim() || content.trim()) {
      const newNote = {
        id: crypto.randomUUID(),
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: false,
        isArchived: false,
        tags: ['quick-capture']
      }
      
      await window.electronAPI.createNote(newNote)
    }
    
    setTitle('')
    setContent('')
    window.electronAPI.closeQuickCapture()
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div className="w-full h-screen bg-vellum-light dark:bg-vellum-dark border border-vellum-light-border dark:border-vellum-dark-border rounded-xl flex flex-col overflow-hidden shadow-2xl">
      
      <div 
        className="h-8 px-3 bg-vellum-light-surface dark:bg-vellum-dark-surface border-b border-vellum-light-border dark:border-vellum-dark-border flex items-center justify-between shrink-0"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Quick Capture (Ctrl + Enter to Save)
        </span>
        <button 
          onClick={() => window.electronAPI.closeQuickCapture()}
          className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer p-0.5"
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Input Form Area */}
      <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto" style={{ WebkitAppRegion: 'no-drag' }}>
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Note title..."
          className="w-full bg-transparent font-bold text-sm outline-none text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 border-b border-vellum-light-border dark:border-vellum-dark-border pb-1"
        />
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Jot down your thoughts..."
          className="w-full flex-1 bg-transparent resize-none outline-none text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 pt-1"
        />
      </div>
    </div>
  )
}

export default QuickCapture