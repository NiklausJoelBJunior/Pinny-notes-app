const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  onMaximizeChange: (callback) =>
    ipcRenderer.on('window:maximized', (_event, isMaximized) => callback(isMaximized)),

  openSticky: (noteId) => ipcRenderer.send('sticky:open', noteId),
  closeSticky: (noteId) => ipcRenderer.send('sticky:close', noteId),
  closeQuickCapture: () => ipcRenderer.send('quickcapture:close'),
  
  popOutNote: (note) => ipcRenderer.send('pop-out-note', note),

  getNotes: () => ipcRenderer.invoke('db:get-notes'),
  createNote: (note) => ipcRenderer.invoke('db:create-note', note),
  updateNote: (id, fields) => ipcRenderer.invoke('db:update-note', id, fields),
  deleteNote: (id) => ipcRenderer.invoke('db:delete-note', id),
  onNotesUpdated: (callback) => {
    ipcRenderer.on('notes:updated', () => callback())
  },

  getNotes: () => ipcRenderer.invoke('db:get-notes'),
  createNote: (note) => ipcRenderer.invoke('db:create-note', note),
  updateNote: (id, fields) => ipcRenderer.invoke('db:update-note', id, fields),
  deleteNote: (id) => ipcRenderer.invoke('db:delete-note', id),
  
  openSticky: (noteId) => ipcRenderer.send('sticky:open', noteId),
  closeSticky: (noteId) => ipcRenderer.send('sticky:close', noteId),
  popOutNote: (note) => ipcRenderer.send('pop-out-note', note),
  closeQuickCapture: () => ipcRenderer.send('quickcapture:close'),
})