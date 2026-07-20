import React, { useState } from 'react'
import { FileText, Pin, Archive, Settings, Moon, Sun, Plus } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useNotes } from '../context/NotesContext'

import logoBlack from '../assets/logo_black.png'
import logoWhite from '../assets/logo_white.png'
import iconImg from '../assets/icon.png'

const Sidebar = ({ currentView, onViewChange }) => {
  const { createNewNote } = useNotes()
  const { darkMode, toggleTheme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { id: 'all-notes', icon: FileText, label: 'All Notes' },
    { id: 'pinned', icon: Pin, label: 'Pinned' },
    { id: 'archive', icon: Archive, label: 'Archive' },
  ]

  const SidebarTooltip = ({ text, children }) => {
    return (
      <div className="relative group/tooltip w-full flex justify-center">
        {children}
        {isCollapsed && (
          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 invisible opacity-0 group-hover/tooltip:visible group-hover/tooltip:opacity-100 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-medium py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none transition-all duration-150 transform translate-x-2 group-hover/tooltip:translate-x-0 border border-neutral-800 dark:border-neutral-200/20">
            {text}
          </div>
        )}
      </div>
    )
  }

  // Handle initialization and redirection simultaneously
  const handleCreateNote = () => {
    createNewNote('', '', ['Draft'])
    onViewChange('all-notes')
  }

  return (
    <div 
      className={`${
        isCollapsed ? 'w-16 px-2' : 'w-64 p-5'
      } h-full bg-vellum-light-surface dark:bg-vellum-dark-surface border-r border-vellum-light-border dark:border-vellum-dark-border flex flex-col justify-between py-5 select-none shrink-0 transition-all duration-300 ease-in-out`}
    >
      
      <div className="space-y-6 flex flex-col items-center w-full">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center gap-3 window-no-drag cursor-pointer focus:outline-none rounded-xl hover:bg-neutral-500/5 transition-colors duration-200 ${
            isCollapsed ? 'justify-center py-2' : 'px-2 py-1.5'
          }`}
        >
          {isCollapsed ? (
            <img src={iconImg} alt="Pinny Icon" className="w-12 h-12 object-contain" />
          ) : (
            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <img src={darkMode ? logoWhite : logoBlack} alt="Pinny Logo" className="h-14 object-contain" />
            </div>
          )}
        </button>

        <SidebarTooltip text="New Note">
          <button 
            onClick={handleCreateNote}
            className={`flex items-center justify-center bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition-all text-sm shadow-sm cursor-pointer ${
              isCollapsed ? 'w-10 h-10 p-0' : 'w-full gap-2 py-2.5 px-4'
            }`}
          >
            <Plus size={16} strokeWidth={2.5} className="shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">New Note</span>}
          </button>
        </SidebarTooltip>

        <nav className="space-y-1 pt-2 w-full">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <SidebarTooltip key={item.id} text={item.label}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center py-2.5 h-10' : 'gap-3 px-3 py-2'
                  } ${
                    isActive
                      ? 'text-accent bg-white dark:bg-white/5 shadow-xs font-semibold'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </button>
              </SidebarTooltip>
            )
          })}
        </nav>
      </div>

      <div className="space-y-1 border-t border-vellum-light-border dark:border-vellum-dark-border pt-4 w-full">
        <SidebarTooltip text="Settings">
          <button 
            onClick={() => onViewChange('settings')}
            className={`w-full flex items-center rounded-lg text-sm font-medium transition-all cursor-pointer ${
              isCollapsed ? 'justify-center py-2.5 h-10' : 'gap-3 px-3 py-2'
            } ${
              currentView === 'settings'
                ? 'text-accent bg-white dark:bg-white/5 shadow-xs font-semibold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
            }`}
          >
            <Settings size={18} className="shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Settings</span>}
          </button>
        </SidebarTooltip>
        
        <SidebarTooltip text={darkMode ? 'Light Mode' : 'Dark Mode'}>
          <button 
            onClick={toggleTheme}
            className={`w-full flex items-center rounded-lg text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors ${
              isCollapsed ? 'justify-center py-2.5 h-10' : 'gap-3 px-3 py-2'
            }`}
          >
            {darkMode ? <Sun size={18} className="text-amber-500 shrink-0" /> : <Moon size={18} className="shrink-0" />}
            {!isCollapsed && <span className="whitespace-nowrap">{darkMode ? 'Light Appearance' : 'Dark Appearance'}</span>}
          </button>
        </SidebarTooltip>
      </div>

    </div>
  )
}

export default Sidebar