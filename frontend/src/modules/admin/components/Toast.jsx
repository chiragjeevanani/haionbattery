import { useCallback, useState } from 'react'
import { ToastContext } from './toastState.js'

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const push = useCallback((message, kind = 'ok') => {
    const id = Math.random().toString(36).slice(2)
    setItems(list => [...list, { id, message, kind }])
    setTimeout(() => setItems(list => list.filter(i => i.id !== id)), 3600)
  }, [])
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="a-toasts" role="status" aria-live="polite">
        {items.map(t => <div key={t.id} className={`a-toast${t.kind === 'error' ? ' error' : ''}`}>{t.message}</div>)}
      </div>
    </ToastContext.Provider>
  )
}
