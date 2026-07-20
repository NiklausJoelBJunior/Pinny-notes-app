import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import pkg from 'electron-updater';

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV === 'development'
const { autoUpdater } = pkg;

let mainWindow
let quickCaptureWindow
const stickyWindows = new Map() 

const dbPath = path.join(app.getPath('userData'), 'db.json')
const adapter = new JSONFile(dbPath)
const db = new Low(adapter, { notes: [] })

function loadRoute(win, route) {
  if (isDev) {
    win.loadURL(`http://localhost:5173/#${route}`)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'), { hash: route })
  }
}

function broadcastNotesUpdate() {
  const allWindows = BrowserWindow.getAllWindows()
  allWindows.forEach(win => {
    win.webContents.send('notes:updated')
  })
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#000000',
    icon: path.join(__dirname, '../src/assets/icon.png'),
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  loadRoute(mainWindow, '/')

  if (isDev) {
    mainWindow.webContents.openDevTools()
  } else {
    // Disable DevTools shortcuts in production
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (
        input.key === 'F12' ||
        (input.control && input.shift && (input.key.toLowerCase() === 'i' || input.key.toLowerCase() === 'j')) ||
        (input.control && input.key.toLowerCase() === 'u')
      ) {
        event.preventDefault()
      }
    })
  }

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    }
  })
}

function createQuickCapture() {
  if (quickCaptureWindow) {
    quickCaptureWindow.show()
    quickCaptureWindow.focus()
    return
  }

  quickCaptureWindow = new BrowserWindow({
    width: 480,
    height: 200,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    transparent: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  loadRoute(quickCaptureWindow, '/quick-capture')

  quickCaptureWindow.on('blur', () => quickCaptureWindow?.hide())
  quickCaptureWindow.on('closed', () => { quickCaptureWindow = null })
}

function createStickyWindow(noteId) {
  if (stickyWindows.has(noteId)) {
    stickyWindows.get(noteId).focus()
    return
  }

  const win = new BrowserWindow({
    width: 280,
    height: 280,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  loadRoute(win, `/sticky/${noteId}`)

  win.on('closed', () => stickyWindows.delete(noteId))
  stickyWindows.set(noteId, win)
}

// IPC Handlers
ipcMain.on('window:minimize', () => mainWindow.minimize())
ipcMain.on('window:maximize', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize()
  else mainWindow.maximize()
})
ipcMain.on('window:close', () => mainWindow.close())

ipcMain.on('sticky:open', (_event, noteId) => createStickyWindow(noteId))
ipcMain.on('sticky:close', (_event, noteId) => {
  stickyWindows.get(noteId)?.close()
})
ipcMain.on('quickcapture:close', () => quickCaptureWindow?.hide())

ipcMain.on('pop-out-note', (event, notePayload) => {
  createStickyWindow(notePayload.id)
})

ipcMain.handle('db:get-notes', async () => {
  await db.read()
  return db.data.notes || []
})

ipcMain.handle('db:create-note', async (_event, newNote) => {
  await db.read()
  db.data.notes.unshift(newNote) 
  broadcastNotesUpdate()
  await db.write()
  return newNote
})

ipcMain.handle('db:update-note', async (_event, id, fields) => {
  await db.read()
  const index = db.data.notes.findIndex(note => note.id === id)
  if (index !== -1) {
    db.data.notes[index] = {
      ...db.data.notes[index],
      ...fields,
      updatedAt: new Date().toISOString()
    }
    db.data.notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    await db.write()
    broadcastNotesUpdate()
  }
  return db.data.notes
})

ipcMain.handle('db:delete-note', async (_event, id) => {
  await db.read()
  db.data.notes = db.data.notes.filter(note => note.id !== id)
  await db.write()
  broadcastNotesUpdate()
  return true
})

app.whenReady().then(async () => {
  await db.read()
  createMainWindow()

  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify()
  }

  const registered = globalShortcut.register('CommandOrControl+Alt+N', () => {
  createQuickCapture()
})
  if (!registered) console.error('Quick-capture shortcut registration failed')

  mainWindow.on('maximize', () => mainWindow.webContents.send('window:maximized', true))
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window:maximized', false))
})

app.on('before-quit', () => {
  app.isQuitting = true
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && app.isQuitting) {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  else if (mainWindow) mainWindow.show()
})