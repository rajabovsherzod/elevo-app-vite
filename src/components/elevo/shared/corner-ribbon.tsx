interface CornerRibbonProps {
  label: string
  color: string
}

export function CornerRibbon({ label, color }: CornerRibbonProps) {
  return (
    <div
      className="absolute top-0 right-0 overflow-hidden pointer-events-none"
      style={{ width: 84, height: 84 }}
    >
      <div
        className="absolute"
        style={{
          top: 14,
          right: -23,
          width: 88,
          background: color,
          color: "#fff",
          fontSize: 7.5,
          fontWeight: 900,
          textAlign: "center",
          padding: "3.5px 0",
          transform: "rotate(45deg)",
          letterSpacing: "0.13em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  )
}
