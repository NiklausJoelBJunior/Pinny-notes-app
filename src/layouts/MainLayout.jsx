// src/layouts/MainLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Titlebar from '../components/Titlebar'

const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-vellum-light text-neutral-800 dark:bg-vellum-dark dark:text-neutral-200 transition-colors duration-200">
      
      <Titlebar />

      <div className="flex flex-1 h-full overflow-hidden">
        <Sidebar />

        {/* Main Application Window Canvas content view */}
        <main className="flex-1 h-full overflow-hidden relative">
          <Outlet />
        </main>
      </div>

    </div>
  )
}

export default MainLayout