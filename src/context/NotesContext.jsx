import React, { createContext, useContext, useState, useEffect } from 'react'

const NotesContext = createContext()

export const useNotes = () => useContext(NotesContext)

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([])
  const [activeNoteId, setActiveNoteId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Independent Custom Tags State (retained in localStorage for local settings)
  const [customTags, setCustomTags] = useState(() => {
    const saved = localStorage.getItem('vellum-tags')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('vellum-tags', JSON.stringify(customTags))
  }, [customTags])

  // Fetch notes from the local Electron lowdb backend
  const fetchNotes = async () => {
    if (window.electronAPI) {
      try {
        const data = await window.electronAPI.getNotes()
        setNotes(data || [])
      } catch (error) {
        console.error("Failed to load notes from database:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchNotes()

    if (window.electronAPI && window.electronAPI.onNotesUpdated) {
      window.electronAPI.onNotesUpdated(() => {
        fetchNotes()
      })
    }

    const handleFocus = () => {
      fetchNotes()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const activeNote = notes.find(n => n.id === activeNoteId)

  // --- Dedicated Tag Management ---
  const addCustomTag = (tag) => {
    const cleanTag = tag.replace(/,/g, '').trim()
    if (cleanTag && !customTags.some(t => t.toLowerCase() === cleanTag.toLowerCase())) {
      setCustomTags(prev => [...prev, cleanTag])
    }
  }

  const deleteCustomTag = (tagToDelete) => {
    setCustomTags(prev => prev.filter(t => t !== tagToDelete))
    notes.forEach(note => {
      if ((note.tags || []).includes(tagToDelete)) {
        updateNote(note.id, {
          tags: note.tags.filter(t => t !== tagToDelete)
        })
      }
    })
  }

  const renameCustomTag = (oldTag, newTag) => {
    const cleanNew = newTag.trim()
    if (!cleanNew) return

    setCustomTags(prev => prev.map(t => t === oldTag ? cleanNew : t))
    notes.forEach(note => {
      if ((note.tags || []).includes(oldTag)) {
        updateNote(note.id, {
          tags: note.tags.map(t => t === oldTag ? cleanNew : t)
        })
      }
    })
  }

  // --- Database-Backed Note Management (Lowdb via IPC) ---
  const createNewNote = async (title = '', content = '', tags = []) => {
    const newNote = {
      id: crypto.randomUUID(),
      title,
      content,
      tags,
      isPinned: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (window.electronAPI) {
      await window.electronAPI.createNote(newNote)
      await fetchNotes()
      setActiveNoteId(newNote.id)
    }
  }

  const updateActiveNote = async (updates) => {
    if (!activeNoteId) return
    if (window.electronAPI) {
      const updated = await window.electronAPI.updateNote(activeNoteId, updates)
      setNotes(updated)
    }
  }

  const updateNote = async (id, updates) => {
    if (window.electronAPI) {
      const updated = await window.electronAPI.updateNote(id, updates)
      setNotes(updated)
    }
  }

  const deleteNote = async (id) => {
    if (window.electronAPI) {
      await window.electronAPI.deleteNote(id)
      await fetchNotes()
      if (activeNoteId === id) setActiveNoteId(null)
    }
  }

  return (
    <NotesContext.Provider value={{
      notes,
      activeNote,
      activeNoteId,
      setActiveNoteId,
      createNewNote,
      updateActiveNote,
      updateNote,
      deleteNote,
      isLoading,
      customTags,
      addCustomTag,
      deleteCustomTag,
      renameCustomTag
    }}>
      {children}
    </NotesContext.Provider>
  )
}