/** Friendly driver face with a cap in the profile colour (own design). */
export function CapAvatar({ color, size = 96 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="58" r="30" fill="#FFD9B8" />
      <circle cx="39" cy="60" r="3.5" fill="#2D3036" />
      <circle cx="61" cy="60" r="3.5" fill="#2D3036" />
      <circle cx="33" cy="69" r="5" fill="#FF9E9E" opacity="0.6" />
      <circle cx="67" cy="69" r="5" fill="#FF9E9E" opacity="0.6" />
      <path d="M40 72 Q50 80 60 72" stroke="#2D3036" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* cap */}
      <path d="M18 44 Q20 18 50 16 Q80 18 82 44 Z" fill={color} />
      <rect x="16" y="40" width="68" height="9" rx="4" fill="#2D3036" />
      <path d="M16 47 Q50 60 84 47 L84 50 Q50 64 16 50 Z" fill="#1d1f23" />
      {/* badge: little wheel */}
      <circle cx="50" cy="30" r="7" fill="#F2C94C" />
      <circle cx="50" cy="30" r="3" fill={color} />
    </svg>
  )
}
