import { Link } from "react-router"
import { Check, type LucideIcon } from "@/lib/icons"
import { CornerRibbon } from "@/components/elevo/shared/corner-ribbon"

export interface PricingCardProps {
  title: string
  price: number
  currency?: string
  icon: LucideIcon
  iconColor: string
  features: string[]
  buttonText?: string
  buttonUrl: string
  popular?: boolean
  description?: string
  cornerLabel?: string
  examCount?: number
}

export function PricingCard({
  title,
  price,
  currency = "so'm",
  icon: Icon,
  iconColor,
  features,
  buttonText = "Sotib olish",
  buttonUrl,
  popular = false,
  description,
  cornerLabel,
  examCount = 110,
}: PricingCardProps) {
  return (
    <div
      className="relative overflow-hidden elevo-card flex flex-col"
      style={
        popular
          ? {
              border: `1.5px solid ${iconColor}48`,
              boxShadow: `0 8px 32px ${iconColor}1c, 0 2px 8px rgba(0,0,0,0.07)`,
            }
          : {
              border: "1px solid rgba(148,163,184,0.18)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }
      }
    >
      {/* Top accent stripe */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${iconColor} 0%, ${iconColor}44 100%)`,
          borderRadius: "20px 20px 0 0",
          flexShrink: 0,
        }}
      />

      {/* Embedded corner ribbon */}
      {cornerLabel && <CornerRibbon label={cornerLabel} color={iconColor} />}

      <div className="p-5 flex flex-col flex-1">
        {/* Header row: icon + title */}
        <div className="flex items-center gap-3 mb-4" style={{ paddingRight: cornerLabel ? 40 : 0 }}>
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: popular ? iconColor : `${iconColor}13`,
              border: popular ? "none" : `1px solid ${iconColor}22`,
            }}
          >
            <Icon
              className="w-5 h-5"
              style={{ color: popular ? "#fff" : iconColor }}
              strokeWidth={1.75}
              aria-hidden
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-on-surface leading-tight">{title}</h3>
            {description && (
              <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span
              className="font-black"
              style={{ fontSize: 34, lineHeight: 1, color: iconColor }}
            >
              {price.toLocaleString("uz-UZ")}
            </span>
            <span className="text-sm font-semibold text-on-surface-variant ml-1">
              {currency}
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-1">30 kunlik kirish</p>
        </div>

        {/* Exam count highlight */}
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 mb-4"
          style={{
            background: `${iconColor}11`,
            border: `1px solid ${iconColor}1e`,
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: iconColor,
              flexShrink: 0,
            }}
          />
          <span className="text-[11px] font-black" style={{ color: iconColor }}>
            {examCount.toLocaleString("uz-UZ")} ta imtihon / oyiga
          </span>
        </div>

        {/* Separator */}
        <div className="mb-4" style={{ height: 1, background: "rgba(148,163,184,0.14)" }} />

        {/* Features */}
        <div className="flex-1 flex flex-col gap-2.5 mb-5">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: "50%",
                  background: `${iconColor}15`,
                  marginTop: 2,
                }}
              >
                <Check
                  className="w-2.5 h-2.5"
                  style={{ color: iconColor }}
                  strokeWidth={3.5}
                />
              </div>
              <span className="text-sm text-on-surface leading-relaxed">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <Link
          to={buttonUrl}
          className="w-full py-3.5 rounded-xl font-black text-sm text-center transition-all active:scale-[0.98]"
          style={{
            background: popular ? iconColor : `${iconColor}13`,
            color: popular ? "#fff" : iconColor,
            letterSpacing: "0.01em",
          }}
        >
          {buttonText}
        </Link>
      </div>
    </div>
  )
}
