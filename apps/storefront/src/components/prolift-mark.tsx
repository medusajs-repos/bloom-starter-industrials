interface ProLiftMarkProps {
  className?: string
  /** Color of the icon paths. Defaults to currentColor so it inherits from parent text color. */
  color?: string
  /** Background color of the rounded square container. Pass null to omit the background. */
  bg?: string | null
  /** Size of the container in px. Defaults to 40. */
  size?: number
}

/**
 * ProLift icon mark — the forklift/lift SVG used as a logo badge.
 * Renders a rounded-square container (like an app icon) with the mark inside.
 * Use `bg={null}` to render the raw SVG without a container.
 */
export function ProLiftMark({ className, color = "currentColor", bg = "#0f172a", size = 40 }: ProLiftMarkProps) {
  const mark = (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "60%", height: "60%" }}
      aria-hidden="true"
    >
      <rect x="180" y="100" width="28" height="260" rx="6" fill={color} />
      <rect x="304" y="100" width="28" height="260" rx="6" fill={color} />
      <rect x="100" y="320" width="232" height="28" rx="6" fill={color} />
      <rect x="120" y="348" width="60" height="80" rx="6" fill={color} />
      <rect x="244" y="348" width="60" height="80" rx="6" fill={color} />
      <polygon points="256,80 206,155 236,155 236,210 276,210 276,155 306,155" fill={color} />
    </svg>
  )

  if (bg === null) {
    return (
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <rect x="180" y="100" width="28" height="260" rx="6" fill={color} />
        <rect x="304" y="100" width="28" height="260" rx="6" fill={color} />
        <rect x="100" y="320" width="232" height="28" rx="6" fill={color} />
        <rect x="120" y="348" width="60" height="80" rx="6" fill={color} />
        <rect x="244" y="348" width="60" height="80" rx="6" fill={color} />
        <polygon points="256,80 206,155 236,155 236,210 276,210 276,155 306,155" fill={color} />
      </svg>
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-xl flex-shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size, background: bg, borderRadius: Math.round(size * 0.2) }}
    >
      {mark}
    </div>
  )
}
