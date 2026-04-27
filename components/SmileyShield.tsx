'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Upload, Download, RefreshCw, Eye, EyeOff,
  Scan, CheckCircle, AlertCircle, Loader2, Shield, Play, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TutorialModal } from './TutorialModal'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type CoverageType = 'classic' | 'cool' | 'star' | 'blur'

interface FaceBox {
  xPct: number; yPct: number; wPct: number; hPct: number
  xNat: number; yNat: number; wNat: number; hNat: number
}
interface DetectedFace {
  id: string; box: FaceBox; covered: boolean
  centerX: number | null  // % of image width, null = use detected center
  centerY: number | null  // % of image height
  adjScale: number
}

const PAD = 0.18

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS DRAWING – burned into exported image
// ─────────────────────────────────────────────────────────────────────────────

function drawClassicSmiley(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cx = x + w / 2, cy = y + h / 2, r = Math.max(w, h) / 2
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.22)'; ctx.shadowBlur = r * 0.15; ctx.shadowOffsetY = r * 0.04
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = '#FFD700'; ctx.fill()
  ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = r * 0.05; ctx.stroke()
  ctx.shadowColor = 'transparent'
  const eX = r * 0.28, eY = r * 0.22, eR = r * 0.13
  for (const ex of [cx - eX, cx + eX]) {
    ctx.beginPath(); ctx.arc(ex, cy - eY, eR, 0, Math.PI * 2); ctx.fillStyle = '#1a1a1a'; ctx.fill()
    ctx.beginPath(); ctx.arc(ex - eR * 0.3, cy - eY - eR * 0.25, eR * 0.38, 0, Math.PI * 2); ctx.fillStyle = 'white'; ctx.fill()
  }
  for (const ex of [cx - r * 0.52, cx + r * 0.52]) {
    ctx.beginPath(); ctx.arc(ex, cy + r * 0.15, r * 0.18, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,90,90,0.33)'; ctx.fill()
  }
  ctx.beginPath(); ctx.arc(cx, cy + r * 0.08, r * 0.52, 0.15 * Math.PI, 0.85 * Math.PI)
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = r * 0.09; ctx.lineCap = 'round'; ctx.stroke()
  ctx.restore()
}

function drawCoolSmiley(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cx = x + w / 2, cy = y + h / 2, r = Math.max(w, h) / 2
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.22)'; ctx.shadowBlur = r * 0.15; ctx.shadowOffsetY = r * 0.04
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = '#FFD700'; ctx.fill()
  ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = r * 0.05; ctx.stroke()
  ctx.shadowColor = 'transparent'
  const gTop = cy - r * 0.22, gH = r * 0.32, gW = r * 0.38, gGap = r * 0.18, rnd = gH * 0.3
  for (const lx of [cx - gGap - gW, cx + gGap]) {
    ctx.beginPath()
    if (ctx.roundRect) ctx.roundRect(lx, gTop, gW, gH, rnd); else ctx.rect(lx, gTop, gW, gH)
    ctx.fillStyle = '#1a1a1a'; ctx.fill()
  }
  ctx.beginPath(); ctx.moveTo(cx - gGap, gTop + gH * 0.42); ctx.lineTo(cx + gGap, gTop + gH * 0.42)
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = r * 0.07; ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx - gGap - gW, gTop + gH * 0.42); ctx.lineTo(cx - r, gTop + gH * 0.28); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx + gGap + gW, gTop + gH * 0.42); ctx.lineTo(cx + r, gTop + gH * 0.28); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx - r * 0.28, cy + r * 0.42)
  ctx.quadraticCurveTo(cx + r * 0.12, cy + r * 0.62, cx + r * 0.42, cy + r * 0.4)
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = r * 0.09; ctx.lineCap = 'round'; ctx.stroke()
  ctx.restore()
}

function drawStarSticker(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cx = x + w / 2, cy = y + h / 2, r = Math.max(w, h) / 2
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = r * 0.15; ctx.shadowOffsetY = r * 0.04
  const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.25, r * 0.1, cx, cy, r)
  grad.addColorStop(0, '#FFF9C4'); grad.addColorStop(1, '#FFC107')
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI / 5) - Math.PI / 2
    const sr = i % 2 === 0 ? r : r * 0.42
    i === 0 ? ctx.moveTo(cx + sr * Math.cos(angle), cy + sr * Math.sin(angle))
             : ctx.lineTo(cx + sr * Math.cos(angle), cy + sr * Math.sin(angle))
  }
  ctx.closePath(); ctx.fillStyle = grad; ctx.fill()
  ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = r * 0.06; ctx.stroke()
  ctx.shadowColor = 'transparent'
  ctx.beginPath(); ctx.arc(cx - r * 0.18, cy - r * 0.18, r * 0.18, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.52)'; ctx.fill()
  ctx.restore()
}

function drawBlurredFace(
  ctx: CanvasRenderingContext2D, img: HTMLImageElement,
  x: number, y: number, w: number, h: number, nW: number, nH: number,
) {
  const blurPx = Math.max(14, Math.min(w, h) * 0.12)
  ctx.save()
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.clip()
  ctx.filter = `blur(${blurPx}px)`; ctx.drawImage(img, 0, 0, nW, nH)
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG OVERLAY COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function ClassicSVG() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" style={{ overflow: 'visible' }}>
      <circle cx="50" cy="52" r="47" fill="#F59E0B" opacity="0.18" />
      <circle cx="50" cy="50" r="46" fill="#FFD700" stroke="#F59E0B" strokeWidth="3" />
      <circle cx="35" cy="38" r="7.5" fill="#1a1a1a" /><circle cx="32" cy="35" r="3" fill="white" />
      <circle cx="65" cy="38" r="7.5" fill="#1a1a1a" /><circle cx="62" cy="35" r="3" fill="white" />
      <ellipse cx="24" cy="57" rx="9" ry="7" fill="rgba(255,90,90,0.35)" />
      <ellipse cx="76" cy="57" rx="9" ry="7" fill="rgba(255,90,90,0.35)" />
      <path d="M 28 57 Q 50 80 72 57" stroke="#1a1a1a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function CoolSVG() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" style={{ overflow: 'visible' }}>
      <circle cx="50" cy="52" r="47" fill="#F59E0B" opacity="0.18" />
      <circle cx="50" cy="50" r="46" fill="#FFD700" stroke="#F59E0B" strokeWidth="3" />
      <rect x="14" y="30" width="29" height="21" rx="6" fill="#1a1a1a" />
      <rect x="57" y="30" width="29" height="21" rx="6" fill="#1a1a1a" />
      <line x1="43" y1="40" x2="57" y2="40" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" />
      <line x1="14" y1="39" x2="4" y2="36" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
      <line x1="86" y1="39" x2="96" y2="36" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
      <circle cx="22" cy="37" r="5" fill="rgba(255,255,255,0.22)" /><circle cx="65" cy="37" r="5" fill="rgba(255,255,255,0.22)" />
      <path d="M 30 64 Q 56 80 72 62" stroke="#1a1a1a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function StarSVG() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="sg" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FFF9C4" /><stop offset="100%" stopColor="#FFC107" />
        </radialGradient>
      </defs>
      <polygon points="50,4 61,35 95,35 68,57 79,92 50,70 21,92 32,57 5,35 39,35"
        fill="url(#sg)" stroke="#F59E0B" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="40" cy="36" r="9" fill="rgba(255,255,255,0.48)" />
    </svg>
  )
}

function BlurOverlay() {
  return (
    <div className="w-full h-full rounded-full" style={{
      backdropFilter: 'blur(20px) saturate(0.6)',
      WebkitBackdropFilter: 'blur(20px) saturate(0.6)',
      background: 'rgba(200,210,230,0.18)',
      boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.3)',
    }} />
  )
}

function BlurPreviewChip() {
  return (
    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-sky-300 via-indigo-300 to-violet-400 flex items-center justify-center relative">
      <div className="absolute inset-0" style={{ backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }} />
      <span className="relative text-white text-[10px] font-bold leading-tight text-center px-0.5">טשטוש</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COVERAGE TYPE PICKER
// ─────────────────────────────────────────────────────────────────────────────

const COVERAGE_OPTIONS: { id: CoverageType; label: string }[] = [
  { id: 'classic', label: 'סמיילי קלאסי' },
  { id: 'cool',    label: 'סמיילי מגניב' },
  { id: 'star',    label: 'כוכב' },
  { id: 'blur',    label: 'טשטוש' },
]

function CoveragePicker({ value, onChange }: { value: CoverageType; onChange: (v: CoverageType) => void }) {
  const previews: Record<CoverageType, React.ReactNode> = {
    classic: <ClassicSVG />, cool: <CoolSVG />, star: <StarSVG />, blur: <BlurPreviewChip />,
  }
  return (
    <div className="flex gap-3 flex-wrap justify-center">
      {COVERAGE_OPTIONS.map(opt => (
        <button key={opt.id} onClick={() => onChange(opt.id)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
            value === opt.id
              ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100 scale-105'
              : 'border-gray-200 bg-white/80 hover:border-indigo-200 hover:bg-gray-50'
          }`}>
          <div className="w-12 h-12">{previews[opt.id]}</div>
          <span className={`text-xs font-medium ${value === opt.id ? 'text-indigo-700' : 'text-gray-500'}`}>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEPS INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

function Steps({ current }: { current: number }) {
  const steps = [{ n: 1, label: 'העלו תמונה' }, { n: 2, label: 'זהו פנים' }, { n: 3, label: 'בחרו מי יוסתר' }, { n: 4, label: 'הורידו' }]
  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {steps.map((step, i) => (
        <div key={step.n} className="flex items-center gap-1">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
            current >= step.n ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/60 text-gray-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              current >= step.n ? 'bg-white text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
              {current > step.n ? '✓' : step.n}
            </span>
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {i < steps.length - 1 && <div className={`w-4 h-0.5 transition-colors duration-300 ${current > step.n ? 'bg-indigo-400' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function SmileyShield() {
  // ── Image & face state ──────────────────────────────────────────────────
  const [imageUrl,       setImageUrl]       = useState<string | null>(null)
  const [faces,          setFaces]          = useState<DetectedFace[]>([])
  const [coverageType,   setCoverageType]   = useState<CoverageType>('classic')
  const [isDetecting,    setIsDetecting]    = useState(false)
  const [modelsLoaded,   setModelsLoaded]   = useState(false)
  const [modelLoadError, setModelLoadError] = useState(false)
  const [uploadError,    setUploadError]    = useState<string | null>(null)
  const [hasDetected,    setHasDetected]    = useState(false)
  const [isDownloading,  setIsDownloading]  = useState(false)
  const [isDragging,     setIsDragging]     = useState(false)
  const [tutorialOpen,   setTutorialOpen]   = useState(false)

  // ── Refs ────────────────────────────────────────────────────────────────
  const imageRef      = useRef<HTMLImageElement>(null)
  const fileInputRef  = useRef<HTMLInputElement>(null)

  // Drag state
  const draggingId    = useRef<string | null>(null)
  const dragStart     = useRef<{ x: number; y: number } | null>(null)
  const dragStartCenter = useRef<{ x: number; y: number } | null>(null)
  const hasDragged    = useRef(false)

  // Resize state
  const resizingId    = useRef<string | null>(null)
  const resizeStart   = useRef<{ x: number; y: number } | null>(null)
  const resizeStartScale = useRef(1)
  const resizeCenter  = useRef<{ x: number; y: number } | null>(null)

  const currentStep = !imageUrl ? 0 : !hasDetected ? 1 : faces.some(f => f.covered) ? 3 : 2

  // ── Load face-api.js models ──────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false
    import('face-api.js').then(async faceapi => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
        if (!cancelled) setModelsLoaded(true)
      } catch { if (!cancelled) setModelLoadError(true) }
    }).catch(() => { if (!cancelled) setModelLoadError(true) })
    return () => { cancelled = true }
  }, [])

  // ── File handling ────────────────────────────────────────────────────────

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('הקובץ שנבחר אינו תמונה. אנא בחר קובץ תמונה.')
      return
    }
    setUploadError(null); setFaces([]); setHasDetected(false)
    const url = URL.createObjectURL(file)
    setImageUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url })
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) processFile(file)
  }, [processFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]; if (file) processFile(file)
  }, [processFile])

  // ── Face detection ───────────────────────────────────────────────────────

  const detectFaces = useCallback(async () => {
    const img = imageRef.current
    if (!img || !modelsLoaded) return
    setIsDetecting(true); setFaces([])
    try {
      const faceapi = await import('face-api.js')
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 })
      const detections = await faceapi.detectAllFaces(img, options)
      const nW = img.naturalWidth, nH = img.naturalHeight
      setFaces(detections.map((det, i) => {
        const { x, y, width: w, height: h } = det.box
        // face-api returns coords in natural pixel space; convert to % using natural dims
        return {
          id: `face-${i}-${Date.now()}`,
          box: { xPct: x/nW*100, yPct: y/nH*100, wPct: w/nW*100, hPct: h/nH*100,
                 xNat: x, yNat: y, wNat: w, hNat: h },
          covered: false,
          centerX: null, centerY: null, adjScale: 1,
        }
      }))
      setHasDetected(true)
    } finally { setIsDetecting(false) }
  }, [modelsLoaded])

  const coverAll   = useCallback(() => setFaces(p => p.map(f => ({ ...f, covered: true  }))), [])
  const uncoverAll = useCallback(() => setFaces(p => p.map(f => ({ ...f, covered: false }))), [])
  const toggleFace = useCallback((id: string) =>
    setFaces(p => p.map(f => f.id === id ? { ...f, covered: !f.covered } : f)), [])

  // ── Download ─────────────────────────────────────────────────────────────

  const downloadImage = useCallback(async () => {
    const img = imageRef.current
    if (!img || !imageUrl) return
    setIsDownloading(true)
    try {
      const nW = img.naturalWidth, nH = img.naturalHeight
      const canvas = document.createElement('canvas')
      canvas.width = nW; canvas.height = nH
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, nW, nH)
      for (const face of faces) {
        if (!face.covered) continue
        const detCX = face.box.xNat + face.box.wNat / 2
        const detCY = face.box.yNat + face.box.hNat / 2
        const cx = face.centerX != null ? face.centerX / 100 * nW : detCX
        const cy = face.centerY != null ? face.centerY / 100 * nH : detCY
        const baseW = face.box.wNat * (1 + PAD * 2)
        const baseH = face.box.hNat * (1 + PAD * 2)
        const w = baseW * face.adjScale
        const h = baseH * face.adjScale
        const x = cx - w / 2
        const y = cy - h / 2
        if      (coverageType === 'classic') drawClassicSmiley(ctx, x, y, w, h)
        else if (coverageType === 'cool')    drawCoolSmiley(ctx, x, y, w, h)
        else if (coverageType === 'star')    drawStarSticker(ctx, x, y, w, h)
        else if (coverageType === 'blur')    drawBlurredFace(ctx, img, x, y, w, h, nW, nH)
      }
      canvas.toBlob(blob => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.download = 'smiley-shield.png'; a.href = url; a.click()
        URL.revokeObjectURL(url); setIsDownloading(false)
      }, 'image/png')
    } catch { setIsDownloading(false) }
  }, [imageUrl, faces, coverageType])

  // ── Reset ─────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setImageUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null })
    setFaces([]); setHasDetected(false); setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  // ── Face overlay renderer ─────────────────────────────────────────────────

  const renderOverlay = (face: DetectedFace) => {
    // Compute center + size
    const detCX = face.box.xPct + face.box.wPct / 2
    const detCY = face.box.yPct + face.box.hPct / 2
    const cx = face.centerX ?? detCX
    const cy = face.centerY ?? detCY
    const baseW = face.box.wPct * (1 + PAD * 2)
    const baseH = face.box.hPct * (1 + PAD * 2)
    const w = baseW * face.adjScale
    const h = baseH * face.adjScale
    const left = cx - w / 2
    const top  = cy - h / 2

    const getImgRect = () => imageRef.current?.getBoundingClientRect() ?? new DOMRect()

    const onDragDown = (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation()
      e.currentTarget.setPointerCapture(e.pointerId)
      draggingId.current = face.id
      dragStart.current = { x: e.clientX, y: e.clientY }
      dragStartCenter.current = { x: cx, y: cy }
      hasDragged.current = false
    }

    const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (draggingId.current !== face.id || !dragStart.current) return
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true
      if (!hasDragged.current) return
      const rect = getImgRect()
      setFaces(prev => prev.map(f => f.id === face.id ? {
        ...f,
        centerX: dragStartCenter.current!.x + dx / rect.width  * 100,
        centerY: dragStartCenter.current!.y + dy / rect.height * 100,
      } : f))
    }

    const onDragUp = () => {
      if (draggingId.current === face.id && !hasDragged.current) toggleFace(face.id)
      draggingId.current = null; dragStart.current = null; hasDragged.current = false
    }

    const onResizeDown = (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation()
      e.currentTarget.setPointerCapture(e.pointerId)
      resizingId.current = face.id
      resizeStart.current = { x: e.clientX, y: e.clientY }
      resizeStartScale.current = face.adjScale
      const rect = getImgRect()
      resizeCenter.current = {
        x: rect.left + cx / 100 * rect.width,
        y: rect.top  + cy / 100 * rect.height,
      }
    }

    const onResizeMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (resizingId.current !== face.id || !resizeCenter.current || !resizeStart.current) return
      const startDist = Math.hypot(resizeStart.current.x - resizeCenter.current.x, resizeStart.current.y - resizeCenter.current.y)
      const curDist   = Math.hypot(e.clientX - resizeCenter.current.x, e.clientY - resizeCenter.current.y)
      if (startDist < 2) return
      const newScale = Math.max(0.3, Math.min(6, resizeStartScale.current * curDist / startDist))
      setFaces(prev => prev.map(f => f.id === face.id ? { ...f, adjScale: newScale } : f))
    }

    const onResizeUp = () => { resizingId.current = null }

    const content = !face.covered
      ? <div className="w-full h-full rounded-full border-2 border-dashed border-white/60 bg-white/10" />
      : coverageType === 'blur'    ? <BlurOverlay />
      : coverageType === 'classic' ? <ClassicSVG />
      : coverageType === 'cool'    ? <CoolSVG />
      : <StarSVG />

    return (
      <div key={face.id}
        className={`absolute select-none overflow-visible cursor-grab active:cursor-grabbing ${
          face.covered ? 'opacity-100' : 'opacity-0 hover:opacity-40'
        }`}
        style={{ left: `${left}%`, top: `${top}%`, width: `${w}%`, height: `${h}%`, zIndex: 10 }}
        title={face.covered ? 'גרור להזזה • לחץ לחשיפה' : 'לחץ לכיסוי'}
        onPointerDown={onDragDown}
        onPointerMove={onDragMove}
        onPointerUp={onDragUp}
      >
        <div className="w-full h-full overflow-hidden">{content}</div>

        {/* Resize handle */}
        {face.covered && (
          <div
            className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full border-2 border-indigo-500 shadow-md flex items-center justify-center cursor-se-resize"
            style={{ transform: 'translate(40%, 40%)', zIndex: 12, touchAction: 'none' }}
            title="גרור לשינוי גודל"
            onPointerDown={onResizeDown}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeUp}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 7L7 1M4 7L7 4" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        )}
      </div>
    )
  }

  const coveredCount = faces.filter(f => f.covered).length

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-amber-50">

      {/* Header */}
      <header className="pt-8 pb-4 px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-11 h-11 shrink-0"><ClassicSVG /></div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">Smiley Shield</h1>
          <Shield className="w-7 h-7 text-indigo-500 shrink-0" />
        </div>
        <p className="text-gray-500 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
          מסתירים פנים בתמונות בקלות, במהירות ובצורה בטוחה
        </p>
        <p className="text-gray-400 text-sm mt-1.5 max-w-md mx-auto">
          מתאים לגננות, מדריכי חוגים, מורים, ועדי הורים וצוותי חינוך שרוצים לשתף תמונות בבטחה.
        </p>
        <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs md:text-sm">
          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
          <span>התמונה לא נשמרת ולא נשלחת אלינו — העיבוד מתבצע בדפדפן שלך בלבד</span>
        </div>

        {/* Tutorial button — prominent */}
        <div className="mt-5">
          <button
            onClick={() => setTutorialOpen(true)}
            className="relative inline-flex items-center gap-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm px-6 py-3 rounded-full shadow-lg shadow-indigo-300 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-25 pointer-events-none" />
            <Play className="w-4 h-4 fill-white shrink-0" />
            איך משתמשים בזה?
          </button>
        </div>
      </header>

      {/* Steps */}
      <div className="px-4 mb-6"><Steps current={currentStep} /></div>

      {/* Model banners */}
      {!modelsLoaded && !modelLoadError && (
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 text-indigo-600 text-sm bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full">
            <Loader2 className="w-4 h-4 animate-spin" /> טוען מודל זיהוי פנים...
          </span>
        </div>
      )}
      {modelLoadError && (
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-full">
            <AlertCircle className="w-4 h-4 shrink-0" /> שגיאה בטעינת מודל זיהוי פנים
          </span>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 pb-20 space-y-4">

        {/* Coverage picker */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/80">
          <p className="text-center text-sm font-semibold text-gray-500 mb-3">בחרו סוג כיסוי לפנים</p>
          <CoveragePicker value={coverageType} onChange={setCoverageType} />
        </div>

        {/* Before / After demo */}
        {!imageUrl && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-sm">
            <p className="text-center text-sm font-semibold text-gray-400 mb-4">כך זה נראה בפועל</p>
            <div className="flex gap-3 justify-center">
              {/* Before */}
              <div className="flex-1 max-w-[160px] flex flex-col items-center gap-2">
                <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-sky-50">
                  <svg viewBox="0 0 120 90" width="100%" preserveAspectRatio="xMidYMid meet">
                    <rect x="0" y="0" width="120" height="90" fill="#e0f2fe" />
                    <rect x="0" y="55" width="120" height="35" fill="#bbf7d0" />
                    {/* Body */}
                    <rect x="38" y="55" width="44" height="38" rx="6" fill="#6b7280" />
                    {/* Ears */}
                    <ellipse cx="38" cy="41" rx="5" ry="6" fill="#f5c5a3" />
                    <ellipse cx="82" cy="41" rx="5" ry="6" fill="#f5c5a3" />
                    {/* Face */}
                    <circle cx="60" cy="40" r="22" fill="#fcd9bd" stroke="#e8a87c" strokeWidth="1" />
                    {/* Hair */}
                    <path d="M 38 34 Q 40 14 60 13 Q 80 14 82 34 Q 75 22 60 21 Q 45 22 38 34Z" fill="#92400e" />
                    {/* Eyebrows */}
                    <path d="M 49 30 Q 53 28 57 30" stroke="#6b3a1f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <path d="M 63 30 Q 67 28 71 30" stroke="#6b3a1f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    {/* Eyes */}
                    <ellipse cx="53" cy="36" rx="3.5" ry="4" fill="white" />
                    <ellipse cx="67" cy="36" rx="3.5" ry="4" fill="white" />
                    <circle cx="54" cy="37" r="2.2" fill="#374151" />
                    <circle cx="68" cy="37" r="2.2" fill="#374151" />
                    <circle cx="54.8" cy="36" r="0.8" fill="white" />
                    <circle cx="68.8" cy="36" r="0.8" fill="white" />
                    {/* Nose */}
                    <path d="M 59 40 Q 57 44 60 45 Q 63 44 61 40" stroke="#d4956a" strokeWidth="1" fill="none" strokeLinecap="round" />
                    {/* Mouth */}
                    <path d="M 53 50 Q 60 55 67 50" stroke="#c0724a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400 font-medium">לפני</span>
              </div>
              {/* Arrow */}
              <div className="flex items-center text-indigo-300 text-xl font-light select-none mt-2">←</div>
              {/* After */}
              <div className="flex-1 max-w-[160px] flex flex-col items-center gap-2">
                <div className="w-full rounded-xl overflow-hidden border border-indigo-100 bg-sky-50">
                  <svg viewBox="0 0 120 90" width="100%" preserveAspectRatio="xMidYMid meet">
                    <rect x="0" y="0" width="120" height="90" fill="#e0f2fe" />
                    <rect x="0" y="55" width="120" height="35" fill="#bbf7d0" />
                    <rect x="38" y="55" width="44" height="38" rx="6" fill="#6b7280" />
                    <circle cx="60" cy="40" r="26" fill="#FFD700" stroke="#F59E0B" strokeWidth="2" />
                    <circle cx="51" cy="34" r="4" fill="#1a1a1a" />
                    <circle cx="69" cy="34" r="4" fill="#1a1a1a" />
                    <ellipse cx="44" cy="43" rx="5" ry="4" fill="rgba(255,90,90,.3)" />
                    <ellipse cx="76" cy="43" rx="5" ry="4" fill="rgba(255,90,90,.3)" />
                    <path d="M 47 44 Q 60 57 73 44" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-xs text-indigo-500 font-semibold">אחרי ✓</span>
              </div>
            </div>
          </div>
        )}

        {/* Upload dropzone */}
        {!imageUrl && (
          <div
            className={`border-2 border-dashed rounded-2xl p-10 md:p-14 text-center cursor-pointer transition-all group ${
              isDragging ? 'border-indigo-500 bg-indigo-50/80 scale-[1.01]'
                         : 'border-indigo-200 bg-white/60 hover:bg-white/80 hover:border-indigo-400'}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <Upload className="w-9 h-9 text-indigo-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-700">גרור תמונה לכאן</p>
                <p className="text-gray-400 mt-1 text-sm">או לחץ לבחירת קובץ מהמחשב</p>
              </div>
              <div className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-md shadow-indigo-200 text-sm pointer-events-none">
                העלאת תמונה
              </div>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP – כל גודל</p>
            </div>
            {uploadError && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" /> {uploadError}
              </div>
            )}
          </div>
        )}

        {/* Image preview card */}
        {imageUrl && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/80 overflow-hidden">

            {/* Image + overlays */}
            <div className="relative bg-gray-950" style={{ lineHeight: 0 }}>
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Uploaded"
                className="w-full h-auto block"
              />

              {faces.map(renderOverlay)}

              {/* Detecting spinner */}
              {isDetecting && (
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center" style={{ zIndex: 30 }}>
                  <div className="bg-white rounded-2xl px-6 py-4 flex items-center gap-3 shadow-2xl">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <span className="font-medium text-gray-800">מזהה פנים...</span>
                  </div>
                </div>
              )}

            </div>

            {/* Face detection banner */}
            {hasDetected && faces.length > 0 && (
              <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <span className="text-gray-700 font-medium">זוהו {faces.length} פנים</span>
                  <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full text-xs font-medium">{coveredCount} מכוסות</span>
                  {faces.length - coveredCount > 0 && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{faces.length - coveredCount} חשופות</span>}
                </div>
                <p className="text-xs text-gray-400">לחץ להסתיר/לחשוף • גרור להזזה • ⤡ שינוי גודל</p>
              </div>
            )}
            {hasDetected && faces.length === 0 && (
              <div className="px-5 py-3 bg-amber-50 border-b border-amber-100">
                <div className="flex items-center gap-2 text-amber-700 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> לא זוהו פנים. נסה תמונה עם פנים ברורות יותר.
                </div>
              </div>
            )}

            {/* Verification reminder */}
            {hasDetected && faces.length > 0 && (
              <div className="px-5 py-2.5 flex items-start gap-2.5 bg-sky-50 border-b border-sky-100">
                <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <p className="text-xs text-sky-700 leading-relaxed">
                  <span className="font-semibold">כדאי לדעת:</span> הזיהוי האוטומטי לא תמיד מושלם. לפני שמורידים את התמונה, מומלץ לוודא שכל הפנים הרלוונטיות סומנו.
                </p>
              </div>
            )}

            {/* ── Face controls ── */}
            <div className="p-4 flex flex-wrap gap-3 items-center justify-between border-b border-gray-100">
              <div className="flex flex-wrap gap-2">
                <Button onClick={detectFaces} disabled={isDetecting || !modelsLoaded}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-xl shadow-md shadow-indigo-100 text-sm">
                  {isDetecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                  {hasDetected ? 'זיהוי מחדש' : 'זיהוי פנים'}
                </Button>
                {faces.length > 0 && (
                  <Button onClick={coverAll} variant="outline"
                    className="gap-2 rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50 text-sm">
                    <Eye className="w-4 h-4" /> כיסוי כל הפנים
                  </Button>
                )}
                {faces.some(f => f.covered) && (
                  <Button onClick={uncoverAll} variant="outline" className="gap-2 rounded-xl text-sm">
                    <EyeOff className="w-4 h-4" /> הסרת כל הכיסויים
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {hasDetected && (
                  <Button onClick={downloadImage} disabled={isDownloading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl shadow-md shadow-emerald-100 text-sm">
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    הורדת תמונה
                  </Button>
                )}
                <Button onClick={reset} variant="ghost" className="gap-2 rounded-xl text-gray-400 text-sm">
                  <RefreshCw className="w-4 h-4" /> איפוס
                </Button>
              </div>
            </div>

            <div className="px-4 pb-4">
              <button onClick={() => fileInputRef.current?.click()}
                className="text-xs text-indigo-400 hover:text-indigo-600 underline transition-colors">
                + העלאת תמונה אחרת
              </button>
            </div>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </main>

      {/* Tutorial modal */}
      <TutorialModal open={tutorialOpen} onClose={() => setTutorialOpen(false)} />

      {/* Footer */}
      <footer className="text-center py-6 px-4 text-sm text-gray-400 border-t border-gray-100 bg-white/40 space-y-2">
        <p>
          נבנה על ידי נעה מור |{' '}
          <a href="https://more-ai.co.il/" target="_blank" rel="noopener noreferrer"
            className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
            More-AI
          </a>
          {' '}— פתרונות AI קטנים לבעיות אמיתיות מהיומיום
        </p>
        <p>
          <a href="mailto:noa@more-ai.co.il"
            className="text-gray-400 hover:text-indigo-500 transition-colors text-xs">
            יש לכם רעיון לכלי קטן שיכול לחסוך זמן? דברו איתי
          </a>
        </p>
      </footer>
    </div>
  )
}
