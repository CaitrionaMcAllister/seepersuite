// Decorative SVG circle/arc — used on placeholder pages and as background accents
interface CircleDecorProps {
  size?: number
  color?: string // Tailwind stroke colour class
  opacity?: number
  filled?: boolean
  className?: string
}

export default function CircleDecor({
  size = 200,
  color = 'stroke-plasma',
  opacity = 0.15,
  filled = false,
  className = '',
}: CircleDecorProps) {
  const r = size / 2 - 2
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={`${color} ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {filled ? (
        <circle cx={size / 2} cy={size / 2} r={r} className="fill-current" />
      ) : (
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth="1.5" className="stroke-current" />
      )}
    </svg>
  )
}
