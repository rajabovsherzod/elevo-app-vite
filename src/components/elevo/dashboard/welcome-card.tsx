import { Crown, Flame, Zap, Sparkles, type LucideIcon } from "@/lib/icons";

interface StatPill {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

interface WelcomeCardProps {
  name:   string;
  level:  string;
  streak: number;
  xp:     number;
}

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Xayrli tong";
  if (h < 17) return "Xayrli kun";
  if (h < 22) return "Xayrli kech";
  return "Xayrli tun";
}

function StatPill({ icon: Icon, label, value }: StatPill) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/15 rounded-full">
      <Icon className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={2.5} aria-hidden />
      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface whitespace-nowrap">
        {value} {label}
      </span>
    </div>
  );
}

export function WelcomeCard({ name, level, streak, xp }: WelcomeCardProps) {
  const pills: StatPill[] = [
    { icon: Crown, label: "daraja", value: level  },
    { icon: Flame,  label: "streak", value: streak },
    { icon: Zap,    label: "XP",     value: xp     },
  ];

  return (
    <section className="relative overflow-hidden elevo-card elevo-card-border elevo-border-glow elevo-mesh p-5">
      <Sparkles
        className="absolute -top-4 -right-4 w-32 h-32 text-primary opacity-[0.08] pointer-events-none"
        aria-hidden
      />

      <div className="relative z-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant mb-1.5">
          {timeGreeting()}
        </p>
        <h1 className="text-xl font-extrabold tracking-tight leading-tight text-on-surface mb-1">
          {name}!{" "}
          <span className="text-primary">Bugun ham davom etamiz.</span>
        </h1>
        <p className="text-sm text-on-surface-variant mt-1 mb-4">
          Elevo bilan IELTS va multilevel imtihonlariga professional tayyorlan.
        </p>

        <div className="flex flex-wrap gap-2">
          {pills.map((pill) => (
            <StatPill key={pill.label} {...pill} />
          ))}
        </div>
      </div>
    </section>
  );
}
