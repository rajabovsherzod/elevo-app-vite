import { PageHeader } from "@/components/elevo/shared/page-header"
import { PricingCard } from "@/components/elevo/upgrade/pricing-card"
import { ActivePlanCard } from "@/components/elevo/upgrade/active-plan-card"
import { Sparkles, BookOpen, Headphones, Mic, PenLine } from "@/lib/icons"
import { useAuthStore } from "@/store/auth.store"
import { useCurrentUser } from "@/hooks/auth/use-current-user"

export default function UpgradePage() {
  const user = useAuthStore((s) => s.user)

  // Fresh /me refetch when this page mounts — SplashProvider already runs
  // useCurrentUser globally, but this ensures data is always current here.
  useCurrentUser()

  const skills = user?.skills

  // Per-skill holat
  const reading   = skills?.reading
  const listening = skills?.listening
  const speaking  = skills?.speaking
  const writing   = skills?.writing

  // Aktiv = paid VA quota bor VA muddat o'tmagan
  function isActive(info?: typeof reading) {
    if (!info) return false
    return info.is_paid && info.quota_remaining > 0 && (
      !info.expires_at || new Date(info.expires_at) > new Date()
    )
  }

  const readingActive   = isActive(reading)
  const listeningActive = isActive(listening)
  const speakingActive  = isActive(speaking)
  const writingActive   = isActive(writing)
  const allActive = readingActive && listeningActive && speakingActive && writingActive

  // Paid lekin quota tugagan (yangilash kerak)
  function isPaidExpired(info?: typeof reading) {
    if (!info) return false
    return info.is_paid && (info.quota_remaining === 0 || (info.expires_at != null && new Date(info.expires_at) <= new Date()))
  }

  const SKILL_CONFIGS = [
    {
      key: "reading",
      title: "Reading",
      description: "Faqat Reading ko'nikmasini rivojlantiring",
      icon: BookOpen,
      iconColor: "#059669",
      price: 35000,
      examCount: 100,
      planKey: "reading",
      features: [
        "Barcha Reading partlari",
        "100+ mashq va test",
        "Batafsil tahlil va javoblar",
        "Progress tracking",
      ],
      info: reading,
      active: readingActive,
    },
    {
      key: "listening",
      title: "Listening",
      description: "Eshitib tushunish ko'nikmasini oshiring",
      icon: Headphones,
      iconColor: "#2563eb",
      price: 35000,
      examCount: 100,
      planKey: "listening",
      features: [
        "Barcha Listening qismlari",
        "Audio mashqlar va testlar",
        "Turli aksent va tezliklar",
        "Batafsil tahlil",
      ],
      info: listening,
      active: listeningActive,
    },
    {
      key: "speaking",
      title: "Speaking",
      description: "AI tutor bilan nutq ko'nikmasini rivojlantiring",
      icon: Mic,
      iconColor: "#db2777",
      price: 35000,
      examCount: 100,
      planKey: "speaking",
      features: [
        "Barcha Speaking qismlari (Part 1-3)",
        "AI tutor bilan real-time amaliyot",
        "Talaffuz va grammatika tahlili",
        "Professional feedback",
      ],
      info: speaking,
      active: speakingActive,
    },
    {
      key: "writing",
      title: "Writing",
      description: "Yozish ko'nikmasini professional darajaga olib chiqing",
      icon: PenLine,
      iconColor: "#d97706",
      price: 35000,
      examCount: 100,
      planKey: "writing",
      features: [
        "Task 1 va Task 2 mashqlari",
        "AI tomonidan batafsil tahlil",
        "Grammatika va lug'at tavsiyalari",
        "Sample essays va templates",
      ],
      info: writing,
      active: writingActive,
    },
  ] as const

  return (
    <div className="flex flex-col gap-6 pb-6">
      <PageHeader
        title="Premium"
        subtitle="O'z darajangizni oshiring"
        icon={Sparkles}
      />

      {/* Hero banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 text-center"
        style={{
          background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 55%, #4f46e5 100%)",
          boxShadow: "0 10px 40px rgba(79,70,229,0.28)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{ top: -40, right: -40, width: 140, height: 140, borderRadius: "50%",
            background: "rgba(167,139,250,0.18)", filter: "blur(32px)" }}
        />
        <div
          className="absolute pointer-events-none"
          style={{ bottom: -30, left: -30, width: 110, height: 110, borderRadius: "50%",
            background: "rgba(99,102,241,0.22)", filter: "blur(28px)" }}
        />

        <div className="relative z-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
          >
            <Sparkles className="w-7 h-7 text-white" strokeWidth={1.75} />
          </div>
          <h2 className="text-2xl font-black text-white mb-1.5" style={{ letterSpacing: "-0.02em" }}>
            Elevo Premium
          </h2>
          <p className="text-sm text-white/70 leading-relaxed max-w-[260px] mx-auto mb-5">
            Professional tayyorgarlik bilan maqsadingizga tez yeting
          </p>
          <div className="flex items-center justify-center gap-0 mx-auto" style={{ maxWidth: 300 }}>
            {[
              { value: "100", label: "exam/oy" },
              { value: "AI",  label: "tahlil"  },
              { value: "30",  label: "kunlik"  },
            ].map((stat, i) => (
              <div key={i} className="flex items-center">
                {i > 0 && (
                  <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.18)", margin: "0 12px" }} />
                )}
                <div className="text-center">
                  <div className="text-lg font-black text-white leading-none">{stat.value}</div>
                  <div className="text-[10px] text-white/60 font-medium mt-0.5">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="flex flex-col gap-4">
        {/* ── Full Bundle ── */}
        {allActive ? (
          <ActivePlanCard
            title="Full Bundle"
            description="Barcha 4 ko'nikma — to'liq kirish"
            icon={Sparkles}
            iconColor="#6366f1"
            expiresAt={reading?.expires_at ?? listening?.expires_at ?? null}
            paidAt={reading?.paid_at ?? null}
            quotaTotal={reading?.quota_total ?? 100}
            quotaRemaining={
              Math.min(
                reading?.quota_remaining ?? 0,
                listening?.quota_remaining ?? 0,
                speaking?.quota_remaining ?? 0,
                writing?.quota_remaining ?? 0,
              )
            }
            skill="full"
          />
        ) : (
          <PricingCard
            title="Full Bundle"
            description="Barcha 4 ko'nikma — to'liq kirish"
            price={100000}
            icon={Sparkles}
            iconColor="#6366f1"
            popular={true}
            cornerLabel="Bundle"
            examCount={400}
            features={[
              "Reading — barcha qismlar va mashqlar",
              "Listening — audio mashqlar va testlar",
              "Speaking — AI tutor bilan amaliyot",
              "Writing — essay va task yozish",
              "Batafsil AI tahlil va feedback",
              "Sertifikat olish imkoniyati",
            ]}
            buttonText="Sotib olish — 100,000 so'm"
            buttonUrl="/payment?plan=full"
          />
        )}

        {/* ── Individual skills ── */}
        {SKILL_CONFIGS.map((cfg) => {
          const showActive = cfg.active || isPaidExpired(cfg.info)
          return showActive && cfg.info ? (
            <ActivePlanCard
              key={cfg.key}
              title={cfg.title}
              description={cfg.description}
              icon={cfg.icon}
              iconColor={cfg.iconColor}
              expiresAt={cfg.info.expires_at}
              paidAt={cfg.info.paid_at}
              quotaTotal={cfg.info.quota_total}
              quotaRemaining={cfg.info.quota_remaining}
              skill={cfg.key}
            />
          ) : (
            <PricingCard
              key={cfg.key}
              title={cfg.title}
              description={cfg.description}
              price={cfg.price}
              icon={cfg.icon}
              iconColor={cfg.iconColor}
              cornerLabel="PRO"
              examCount={cfg.examCount}
              features={cfg.features as unknown as string[]}
              buttonText={`Sotib olish — ${cfg.price.toLocaleString("uz-UZ")} so'm`}
              buttonUrl={`/payment?plan=${cfg.planKey}`}
            />
          )
        })}
      </div>

      {/* Info */}
      <div className="elevo-card elevo-card-border p-5">
        <h3 className="text-sm font-black text-on-surface mb-3">Foydali ma'lumot</h3>
        <div className="flex flex-col gap-2 text-xs text-on-surface-variant leading-relaxed">
          <p>• Full Bundle 25% arzonroq — eng foydali tanlov</p>
          <p>• Har bir tarif oyiga 100 ta imtihon imkoniyati beradi</p>
          <p>• Obuna tugagandan keyin ham natijalar saqlanadi</p>
          <p>• Yangi user sifatida 3 kun, kuniga 25 ta bepul imtihon</p>
        </div>
      </div>
    </div>
  )
}
