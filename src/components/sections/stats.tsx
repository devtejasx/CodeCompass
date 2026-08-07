import { Divider } from "@/components/shared/backdrops";
import { Reveal, RevealItem } from "@/components/shared/reveal";
import { STATS } from "@/lib/data/site";

export function Stats() {
  return (
    <section aria-label="CodeCompass by the numbers" className="relative">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Divider />

        <Reveal stagger={0.08} className="py-12 lg:py-16">
          <RevealItem className="mb-10 text-center text-xs font-medium uppercase tracking-[0.2em] text-white/35">
            Everything a beginner needs, in one place
          </RevealItem>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {STATS.map((stat) => (
              <RevealItem
                key={stat.label}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd className="bg-gradient-to-b from-white to-white/45 bg-clip-text text-3xl font-semibold tracking-tight text-transparent transition-transform duration-300 group-hover:-translate-y-0.5 sm:text-4xl">
                  {stat.value}
                </dd>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </RevealItem>
            ))}
          </dl>
        </Reveal>

        <Divider />
      </div>
    </section>
  );
}
