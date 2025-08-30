"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
  animation?: 'bounce-in' | 'slide-up' | 'glow-pulse' | 'confetti-pop'
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id)
    }, toast.duration || 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast, onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '🎉'
      case 'error':
        return '⚠️'
      case 'info':
        return '💡'
      case 'warning':
        return '🚨'
      default:
        return '📢'
    }
  }

  const getAnimationClass = () => {
    switch (toast.animation) {
      case 'bounce-in':
        return 'animate-bounce-in'
      case 'slide-up':
        return 'animate-slide-up'
      case 'glow-pulse':
        return 'animate-glow-pulse'
      case 'confetti-pop':
        return 'animate-confetti-pop'
      default:
        return 'animate-bounce-in'
    }
  }

  return (
    <div 
      className={`toast ${toast.type} ${isVisible ? 'show' : ''} ${getAnimationClass()} hover-glow`}
      onClick={() => onRemove(toast.id)}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{getIcon()}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{toast.title}</h4>
          {toast.message && (
            <p className="text-sm text-gray-600 mt-1">{toast.message}</p>
          )}
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onRemove(toast.id)
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
