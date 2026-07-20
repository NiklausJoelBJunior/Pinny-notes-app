import React, { useState, useEffect } from 'react'
import { Minus, Square, Copy, X } from 'lucide-react'

const Titlebar = () => {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    if (window.electronAPI?.onMaximizeChange) {
      window.electronAPI.onMaximizeChange((maximizedState) => {
        setIsMaximized(maximizedState)
      })
    }
  }, [])

  const handleMinimize = () => window.electronAPI?.minimizeWindow()
  const handleMaximize = () => window.electronAPI?.maximizeWindow()
  const handleClose = () => window.electronAPI?.closeWindow()

  return (
    <div className="w-full h-8 bg-vellum-light-surface dark:bg-vellum-dark-surface border-b border-vellum-light-border dark:border-vellum-dark-border flex items-center justify-between pl-4 select-none window-drag shrink-0 z-50">
      
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500">
          Pinny
        </span>
      </div>
 
      {/* Right Column: Custom Platform Window Chrome buttons */}
      <div className="flex items-center h-full window-no-drag">
        {/* Minimize Button */}
        <button 
          onClick={handleMinimize}
          className="h-8 w-10 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Minus size={13} />
        </button>

        {/* Maximize / Restore Button */}
        <button 
          onClick={handleMaximize}
          className="h-8 w-10 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          {isMaximized ? (
            <Copy size={11} className="transform -rotate-180 scale-x-[-1]" />
          ) : (
            <Square size={11} />
          )}
        </button>

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="h-8 w-10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-600 transition-colors cursor-pointer"
        >
          <X size={13} />
        </button>
      </div>

    </div>
  )
}

export default Titlebar