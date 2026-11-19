import { cloneElement, isValidElement, useId, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from 'lucide-react'
import { adminApi } from '../../../lib/api.js'
import { useToast } from './toastState.js'

export function PageHead({ title, children, actions }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
      {actions && <div className="page-head__actions">{actions}</div>}
    </div>
  )
}

/** Label + control + hint + error, wired together for screen readers. */
export function Field({ label, hint, error, children }) {
  const id = useId()
  const child = isValidElement(children)
    ? cloneElement(children, { id, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': error ? `${id}-err` : undefined })
    : children
  return (
    <div className="a-field">
      <label htmlFor={id}>{label}</label>
      {hint && <span className="hint">{hint}</span>}
      {child}
      {error && <span className="a-error" id={`${id}-err`}>{error}</span>}
    </div>
  )
}

export const Input = props => <input className="a-input" {...props} />
export const Select = props => <select className="a-select" {...props} />
export const Textarea = props => <textarea className="a-textarea" {...props} />

export function Check({ label, checked, onChange }) {
  return (
    <label className="a-check">
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

/** Uploads picked files and returns their URLs. */
function useUploader() {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const upload = async files => {
    if (!files?.length) return []
    setBusy(true)
    try {
      const { urls } = await adminApi.upload(files)
      return urls
    } catch (e) {
      toast(e.message, 'error')
      return []
    } finally {
      setBusy(false)
    }
  }
  return { upload, busy }
}

/** One picture: preview, upload and remove. */
export function SingleImage({ label, value, onChange, hint }) {
  const { upload, busy } = useUploader()
  const input = useRef(null)
  const pick = async e => {
    const [url] = await upload(e.target.files)
    if (url) onChange(url)
    e.target.value = ''
  }
  return (
    <div className="a-field">
      <span>{label}</span>
      {hint && <span className="hint">{hint}</span>}
      <div className="a-single">
        <div className="a-image">{value ? <img src={value} alt="" /> : null}</div>
        <div className="a-actions">
          <button type="button" className="a-btn a-btn--sm" onClick={() => input.current?.click()} disabled={busy}>
            <ImagePlus /> {busy ? 'Uploading' : value ? 'Replace picture' : 'Upload picture'}
          </button>
          {value && <button type="button" className="a-btn a-btn--sm a-btn--danger" onClick={() => onChange('')}><Trash2 /> Remove</button>}
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={pick} />
        </div>
      </div>
    </div>
  )
}

/** Several pictures: the first one is the cover. Move, remove, add. */
export function ImageList({ label, value, onChange, hint }) {
  const { upload, busy } = useUploader()
  const input = useRef(null)
  const add = async e => {
    const urls = await upload(e.target.files)
    if (urls.length) onChange([...value, ...urls].slice(0, 10))
    e.target.value = ''
  }
  const move = (i, d) => {
    const next = [...value]
    const j = i + d
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className="a-field">
      <span>{label}</span>
      {hint && <span className="hint">{hint}</span>}
      <div className="a-images">
        {value.map((src, i) => (
          <div className="a-image" key={src + i}>
            <img src={src} alt="" />
            {i === 0 && <span className="a-image__first">Cover</span>}
            <div className="a-image__bar">
              <button type="button" aria-label="Move earlier" onClick={() => move(i, -1)} disabled={i === 0}><ArrowLeft /></button>
              <button type="button" aria-label="Remove picture" onClick={() => onChange(value.filter((_, k) => k !== i))}><Trash2 /></button>
              <button type="button" aria-label="Move later" onClick={() => move(i, 1)} disabled={i === value.length - 1}><ArrowRight /></button>
            </div>
          </div>
        ))}
        {value.length < 10 && (
          <label className="a-drop">
            <ImagePlus />
            <span>{busy ? 'Uploading' : 'Add pictures'}</span>
            <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={add} />
          </label>
        )}
      </div>
    </div>
  )
}

export function Confirm({ onConfirm, children, className = 'a-btn a-btn--sm a-btn--danger', label }) {
  return (
    <button
      type="button" className={className} aria-label={label}
      onClick={() => { if (window.confirm('Delete this? This cannot be undone.')) onConfirm() }}
    >
      {children}
    </button>
  )
}
