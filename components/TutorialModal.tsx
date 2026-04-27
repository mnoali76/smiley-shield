'use client'

import React, { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, Play } from 'lucide-react'

// ─── Animation keyframes ─────────────────────────────────────────────────────
const ANIM_CSS = `
@keyframes tut-bounce {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-10px); }
}
@keyframes tut-float {
  0%,100% { transform: translateY(0) rotate(-2deg); }
  50%     { transform: translateY(-13px) rotate(2deg); }
}
@keyframes tut-pop {
  0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
  60%  { transform: scale(1.14) rotate(4deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes tut-scan {
  0%   { transform: translateY(0px);   opacity: 0.85; }
  80%  { transform: translateY(118px); opacity: 0.6;  }
  100% { transform: translateY(118px); opacity: 0;    }
}
@keyframes tut-dl-arrow {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(5px); }
}
@keyframes tut-glow {
  0%,100% { box-shadow: 0 0 0 0   rgba(16,185,129,0.45); }
  50%     { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
}
`

// ─── Slide illustrations ─────────────────────────────────────────────────────

function WelcomeIllus() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5">
      <div style={{ animation: 'tut-bounce 1.6s ease-in-out infinite' }}>
        <svg viewBox="0 0 100 100" width="92" height="92">
          <circle cx="50" cy="50" r="46" fill="#FFD700" stroke="#F59E0B" strokeWidth="3" />
          <circle cx="35" cy="38" r="7"   fill="#1a1a1a" />
          <circle cx="32" cy="35" r="2.5" fill="white" />
          <circle cx="65" cy="38" r="7"   fill="#1a1a1a" />
          <circle cx="62" cy="35" r="2.5" fill="white" />
          <ellipse cx="24" cy="57" rx="8" ry="6" fill="rgba(255,90,90,.35)" />
          <ellipse cx="76" cy="57" rx="8" ry="6" fill="rgba(255,90,90,.35)" />
          <path d="M 27 57 Q 50 80 73 57"
            stroke="#1a1a1a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {['100% פרטיות', 'זיהוי אוטומטי', 'קל ומהיר'].map(t => (
          <span key={t} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-100">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

function UploadIllus() {
  return (
    <div className="flex items-center justify-center h-full">
      <svg viewBox="0 0 260 150" width="260" height="150">
        <defs>
          <filter id="tut-sh" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.18" />
          </filter>
        </defs>
        {/* Drop zone */}
        <rect x="30" y="15" width="200" height="115" rx="12"
          fill="#EEF2FF" stroke="#818CF8" strokeWidth="2.5" strokeDasharray="8 5" />
        {/* Center upload icon */}
        <circle cx="130" cy="90" r="28" fill="#C7D2FE" />
        <path d="M 130 102 L 130 82 M 120 91 L 130 81 L 140 91"
          stroke="#4F46E5" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Floating photo card */}
        <g style={{ animation: 'tut-float 2.2s ease-in-out infinite', transformOrigin: '130px 38px' }}
          filter="url(#tut-sh)">
          <rect x="105" y="12" width="50" height="40" rx="6" fill="white" stroke="#E0E7FF" strokeWidth="1.5" />
          <rect x="112" y="18" width="36" height="27" rx="3" fill="#E0E7FF" />
          <circle cx="121" cy="26" r="5" fill="#A5B4FC" />
          <path d="M 112 39 L 123 27 L 133 35 L 138 30 L 148 39" fill="#A5B4FC" />
        </g>
        <text x="130" y="143" textAnchor="middle" fontSize="11" fill="#6B7280" fontWeight="500">
          גרור תמונה לכאן, או לחץ לבחירת קובץ
        </text>
      </svg>
    </div>
  )
}

function DetectIllus() {
  return (
    <div className="flex items-center justify-center h-full">
      <svg viewBox="0 0 260 155" width="260" height="155">
        {/* Photo background */}
        <rect x="15" y="10" width="230" height="130" rx="10" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="15" y="10" width="230" height="55"  rx="10" fill="#BAE6FD" />
        <rect x="15" y="90" width="230" height="50"  rx="0"  fill="#D1FAE5" style={{ borderRadius: '0 0 10px 10px' }} />
        {/* Person 1 */}
        <rect x="38"  y="85" width="40" height="55" rx="6" fill="#6B7280" />
        <circle cx="58"  cy="57" r="22" fill="#FCD9BD" stroke="#D4A276" strokeWidth="1.5" />
        {/* Person 2 */}
        <rect x="110" y="80" width="40" height="60" rx="6" fill="#9CA3AF" />
        <circle cx="130" cy="50" r="22" fill="#FCD9BD" stroke="#D4A276" strokeWidth="1.5" />
        {/* Person 3 */}
        <rect x="182" y="85" width="40" height="55" rx="6" fill="#6B7280" />
        <circle cx="202" cy="57" r="22" fill="#FCD9BD" stroke="#D4A276" strokeWidth="1.5" />
        {/* Detection boxes (pop in sequentially) */}
        <rect x="35" y="33" width="46" height="46" rx="4"
          fill="rgba(99,102,241,0.1)" stroke="#6366F1" strokeWidth="2" strokeDasharray="5 3"
          style={{ animation: 'tut-pop 0.4s ease-out 0.3s both', transformOrigin: '58px 56px' }} />
        <rect x="107" y="26" width="46" height="46" rx="4"
          fill="rgba(99,102,241,0.1)" stroke="#6366F1" strokeWidth="2" strokeDasharray="5 3"
          style={{ animation: 'tut-pop 0.4s ease-out 0.8s both', transformOrigin: '130px 49px' }} />
        <rect x="179" y="33" width="46" height="46" rx="4"
          fill="rgba(99,102,241,0.1)" stroke="#6366F1" strokeWidth="2" strokeDasharray="5 3"
          style={{ animation: 'tut-pop 0.4s ease-out 1.3s both', transformOrigin: '202px 56px' }} />
        {/* Scanning line */}
        <rect x="15" y="10" width="230" height="2.5" rx="1"
          fill="#6366F1" opacity="0.75"
          style={{ animation: 'tut-scan 2s ease-in-out 0.1s infinite' }} />
        {/* Label */}
        <text x="130" y="150" textAnchor="middle" fontSize="11" fill="#4F46E5" fontWeight="600">
          ✓ זוהו 3 פנים — לחצו &quot;זיהוי פנים&quot;
        </text>
      </svg>
    </div>
  )
}

function SelectIllus() {
  /* Kindergarten: teacher (right, visible) + 3 children (covered with smileys) */
  return (
    <div className="flex items-center justify-center h-full">
      <svg viewBox="0 0 268 180" width="268" height="180">
        {/* Photo frame */}
        <rect x="8" y="8" width="252" height="152" rx="10" fill="#FEF9EC" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="8" y="8"  width="252" height="68" rx="10" fill="#BAE6FD" />
        <rect x="8" y="96" width="252" height="64" rx="0" fill="#BBF7D0" style={{ borderRadius: '0 0 10px 10px' }} />

        {/* ── TEACHER — right side, UNCOVERED, visible ── */}
        <rect x="190" y="98" width="60" height="62" rx="8" fill="#3B82F6" />
        {/* Hair */}
        <path d="M 194 73 Q 202 52 220 52 Q 238 52 246 73"
          stroke="#92400E" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Head */}
        <circle cx="220" cy="75" r="28" fill="#FCD9BD" stroke="#D4A276" strokeWidth="1.5" />
        {/* Eyes */}
        <circle cx="211" cy="69" r="3.5" fill="#374151" />
        <circle cx="229" cy="69" r="3.5" fill="#374151" />
        {/* Smile */}
        <path d="M 208 79 Q 220 91 232 79"
          stroke="#374151" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Badge */}
        <rect x="193" y="135" width="54" height="16" rx="8" fill="white" opacity="0.92" />
        <text x="220" y="147" textAnchor="middle" fontSize="9.5" fill="#059669" fontWeight="700">
          גננת — גלויה ✓
        </text>

        {/* ── CHILD 1 — top-left, COVERED ── */}
        <rect x="16" y="98" width="46" height="62" rx="7" fill="#EF4444" />
        <g style={{ animation: 'tut-pop 0.5s ease-out 0.2s both', transformOrigin: '39px 68px' }}>
          <circle cx="39" cy="68" r="28" fill="#FFD700" stroke="#F59E0B" strokeWidth="2" />
          <circle cx="30" cy="61" r="4"   fill="#1a1a1a" />
          <circle cx="48" cy="61" r="4"   fill="#1a1a1a" />
          <path d="M 27 72 Q 39 83 51 72"
            stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>

        {/* ── CHILD 2 — center-left, COVERED ── */}
        <rect x="82" y="98" width="46" height="62" rx="7" fill="#8B5CF6" />
        <g style={{ animation: 'tut-pop 0.5s ease-out 0.7s both', transformOrigin: '105px 65px' }}>
          <circle cx="105" cy="65" r="28" fill="#FFD700" stroke="#F59E0B" strokeWidth="2" />
          <circle cx="96"  cy="58" r="4"  fill="#1a1a1a" />
          <circle cx="114" cy="58" r="4"  fill="#1a1a1a" />
          <path d="M 93 69 Q 105 80 117 69"
            stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>

        {/* ── CHILD 3 — right-center, COVERED ── */}
        <rect x="149" y="104" width="36" height="56" rx="6" fill="#10B981" />
        <g style={{ animation: 'tut-pop 0.5s ease-out 1.2s both', transformOrigin: '167px 78px' }}>
          <circle cx="167" cy="78" r="24" fill="#FFD700" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="159" cy="72" r="3.5" fill="#1a1a1a" />
          <circle cx="175" cy="72" r="3.5" fill="#1a1a1a" />
          <path d="M 156 81 Q 167 91 178 81"
            stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        {/* Bottom hint */}
        <text x="100" y="173" textAnchor="middle" fontSize="10.5" fill="#374151" fontWeight="600">
          לחצו על פנים לכיסוי / חשיפה
        </text>
      </svg>
    </div>
  )
}

function DownloadIllus() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div style={{ animation: 'tut-float 2s ease-in-out infinite' }}>
        <svg viewBox="0 0 150 95" width="150" height="95">
          {/* Final image frame */}
          <rect x="8" y="5" width="134" height="72" rx="10" fill="#D1FAE5" stroke="#6EE7B7" strokeWidth="2" />
          {/* Teacher visible */}
          <circle cx="45" cy="36" r="19" fill="#FCD9BD" stroke="#D4A276" strokeWidth="1.5" />
          <circle cx="38" cy="30" r="2.5" fill="#374151" />
          <circle cx="52" cy="30" r="2.5" fill="#374151" />
          <path d="M 36 39 Q 45 47 54 39"
            stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Child 1 covered */}
          <circle cx="92" cy="33" r="17" fill="#FFD700" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="85" cy="28" r="2.5" fill="#1a1a1a" />
          <circle cx="99" cy="28" r="2.5" fill="#1a1a1a" />
          <path d="M 83 36 Q 92 44 101 36"
            stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Child 2 covered */}
          <circle cx="124" cy="38" r="13" fill="#FFD700" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="118" cy="34" r="2"  fill="#1a1a1a" />
          <circle cx="130" cy="34" r="2"  fill="#1a1a1a" />
          <path d="M 116 40 Q 124 47 132 40"
            stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Download arrow */}
          <path d="M 75 80 L 75 89 M 68 84 L 75 92 L 82 84"
            stroke="#10B981" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: 'tut-dl-arrow 1s ease-in-out infinite' }} />
        </svg>
      </div>
      <div
        className="bg-emerald-600 text-white text-sm font-semibold px-7 py-2.5 rounded-xl shadow-md shadow-emerald-100"
        style={{ animation: 'tut-glow 1.5s ease-in-out infinite' }}
      >
        הורדת תמונה
      </div>
      <p className="text-xs text-gray-400 text-center leading-relaxed">
        הקובץ נשמר אצלכם בלבד — לא עובר לשרת
      </p>
    </div>
  )
}

// ─── Slide definitions ───────────────────────────────────────────────────────

const SLIDES = [
  {
    illus: <WelcomeIllus />,
    title: 'ברוכים הבאים ל-Smiley Shield!',
    desc: 'מסתירים פנים בתמונות בשניות, ישירות בדפדפן — ללא שמירה בשרת ובפרטיות מלאה',
  },
  {
    illus: <UploadIllus />,
    title: 'שלב 1 — העלו תמונה',
    desc: 'גררו תמונה לאזור ההעלאה, או לחצו לבחירת קובץ מהמחשב. נתמכים: PNG, JPG, WEBP',
  },
  {
    illus: <DetectIllus />,
    title: 'שלב 2 — זיהוי פנים אוטומטי',
    desc: 'לחצו על "זיהוי פנים" — האפליקציה סורקת את התמונה ומסמנת את כל הפנים שזוהו',
  },
  {
    illus: <SelectIllus />,
    title: 'שלב 3 — בחרו מי יוסתר',
    desc: 'לחצו על כל פנים לכיסוי או לחשיפה. למשל: גננת — גלויה, ילדים — מכוסים. ניתן לגרור סמיילי ולשנות גודל. בחרו סוג כיסוי: סמיילי, כוכב, או טשטוש',
  },
  {
    illus: <DownloadIllus />,
    title: 'שלב 4 — הורידו את התמונה',
    desc: 'לחצו "הורדת תמונה" לקבלת הקובץ הסופי. הכל מעובד בדפדפן שלכם — אף תמונה לא נשמרת בשרת',
  },
]

// ─── Modal component ─────────────────────────────────────────────────────────

export function TutorialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const TOTAL = SLIDES.length

  useEffect(() => { if (open) setStep(0) }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowLeft')   setStep(s => Math.min(TOTAL - 1, s + 1))
      if (e.key === 'ArrowRight')  setStep(s => Math.max(0, s - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, TOTAL])

  if (!open) return null

  const slide = SLIDES[step]
  const isFirst = step === 0
  const isLast  = step === TOTAL - 1

  return (
    <>
      <style>{ANIM_CSS}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Modal card */}
        <div
          dir="rtl"
          className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Top bar: progress dots + close */}
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <div className="flex gap-1.5 items-center">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step
                      ? 'w-7 bg-indigo-600'
                      : i < step
                      ? 'w-2 bg-indigo-300'
                      : 'w-2 bg-gray-200 hover:bg-gray-300'
                  }`}
                  aria-label={`שקף ${i + 1}`}
                />
              ))}
              <span className="text-xs text-gray-400 mr-1">{step + 1}/{TOTAL}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="סגור"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Illustration */}
          <div className="h-52 px-2">
            {slide.illus}
          </div>

          {/* Text content */}
          <div className="px-6 pb-3 text-center">
            <h2 className="text-lg font-bold text-gray-800 mb-1.5">{slide.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{slide.desc}</p>
          </div>

          {/* Navigation footer */}
          <div className="flex items-center justify-between px-5 pb-6 pt-2">
            {/* Prev button */}
            {!isFirst ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors px-3 py-2 rounded-xl hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
                הקודם
              </button>
            ) : (
              <div />
            )}

            {/* Next / Start button */}
            {!isLast ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                הבא
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-200 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                בואו נתחיל!
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
