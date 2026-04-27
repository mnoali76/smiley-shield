import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Smiley Shield — הסתרת פנים בתמונות'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)',
          fontFamily: 'sans-serif',
          direction: 'rtl',
        }}
      >
        {/* Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 64,
            padding: '60px 80px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 32,
            border: '2px solid rgba(255,255,255,0.18)',
          }}
        >
          {/* Smiley face SVG */}
          <svg width="180" height="180" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#FFD700" stroke="#F59E0B" strokeWidth="3" />
            <circle cx="35" cy="38" r="7"   fill="#1a1a1a" />
            <circle cx="32" cy="35" r="2.5" fill="white" />
            <circle cx="65" cy="38" r="7"   fill="#1a1a1a" />
            <circle cx="62" cy="35" r="2.5" fill="white" />
            <ellipse cx="24" cy="57" rx="8" ry="6" fill="rgba(255,90,90,0.4)" />
            <ellipse cx="76" cy="57" rx="8" ry="6" fill="rgba(255,90,90,0.4)" />
            <path d="M 27 57 Q 50 80 73 57"
              stroke="#1a1a1a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          </svg>

          {/* Text block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'right' }}>
            <div style={{ fontSize: 64, fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
              Smiley Shield
            </div>
            <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
              הסתרת פנים בתמונות — בקלות ובבטחה
            </div>
            <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
              מתאים לגננות, מורים וצוותי חינוך
            </div>

            {/* Privacy badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 12,
                background: 'rgba(16,185,129,0.25)',
                border: '1.5px solid rgba(16,185,129,0.5)',
                borderRadius: 50,
                padding: '8px 20px',
                width: 'fit-content',
                alignSelf: 'flex-end',
              }}
            >
              <div style={{ fontSize: 18, color: '#6ee7b7' }}>✓</div>
              <div style={{ fontSize: 18, color: '#6ee7b7', fontWeight: 600 }}>
                עיבוד בדפדפן בלבד — ללא שמירה בשרת
              </div>
            </div>

            {/* Domain */}
            <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              more-ai.co.il
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
