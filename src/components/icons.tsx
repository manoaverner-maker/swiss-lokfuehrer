// Own, neutral icons (no company logos).

export function LocoIcon({ size = 40, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M20 8 L30 4 M24 8 L30 4" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <rect x="6" y="10" width="36" height="24" rx="8" fill={color} />
      <rect x="11" y="14" width="10" height="8" rx="2.5" fill="currentColor" opacity="0.85" />
      <rect x="27" y="14" width="10" height="8" rx="2.5" fill="currentColor" opacity="0.85" />
      <circle cx="15" cy="38" r="5" fill={color} />
      <circle cx="33" cy="38" r="5" fill={color} />
      <circle cx="15" cy="38" r="2" fill="currentColor" />
      <circle cx="33" cy="38" r="2" fill="currentColor" />
    </svg>
  )
}

export function SpeakerIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M5 12h5l7-6v20l-7-6H5z" fill="currentColor" />
      <path d="M21 11c2 2.5 2 7.5 0 10M24.5 7.5c4 4.5 4 12.5 0 17" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function GearIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.4-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3.3h-4l-.4 2.7a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.4L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.4 2.5-1c.5.4 1.1.7 1.7 1l.4 2.7h4l.4-2.7c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.4zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"
        transform="translate(-1 0)"
      />
    </svg>
  )
}
