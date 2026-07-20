import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Titlebar from './components/Titlebar'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import SettingsPanel from './components/SettingsPanel'
import QuickCapture from './pages/QuickCapture' 
import StickyView from './pages/StickyView' 

const MainAppLayout = () => {
  const [currentView, setCurrentView] = useState('all-notes')

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-vellum-light dark:bg-vellum-dark selection:bg-accent/20">
      <Titlebar />
      <div className="flex-1 flex overflow-hidden w-full relative">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 h-full overflow-hidden relative">
          {currentView === 'settings' ? (
            <SettingsPanel onClose={() => setCurrentView('all-notes')} />
          ) : (
            <Home currentView={currentView} />
          )}
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainAppLayout />} />
      
      <Route path="/quick-capture" element={<QuickCapture />} />
      
      <Route path="/sticky/:id" element={<StickyView />} />
    </Routes>
  )
}

export default App