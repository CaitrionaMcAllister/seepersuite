interface LinkButtonProps {
  url: string | null | undefined
  label?: string
}

export function LinkButton({ url, label = 'Open ↗' }: LinkButtonProps) {
  if (url && url !== '#') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] px-2.5 py-1 rounded-full border border-seeper-border/40 text-[var(--color-muted)] hover:border-plasma/60 hover:text-plasma transition-all"
      >
        {label}
      </a>
    )
  }
  return (
    <span className="text-[10px] px-2.5 py-1 rounded-full border border-seeper-border/40 text-[var(--color-muted)] opacity-40">
      {label}
    </span>
  )
}
