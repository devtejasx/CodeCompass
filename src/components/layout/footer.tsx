import { Github, Linkedin, Twitter, Youtube } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Divider } from "@/components/shared/backdrops";
import { FOOTER_COLUMNS, SITE } from "@/lib/data/site";

const SOCIALS = [
  { label: "GitHub", href: "#", icon: Github },
  { label: "X", href: "#", icon: Twitter },
  { label: "LinkedIn", href: "#", icon: Linkedin },
  { label: "YouTube", href: "#", icon: Youtube },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-[#09090B]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-[38rem] -translate-x-1/2 rounded-full bg-indigo-700/10 blur-[130px]"
      />

      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2.6fr]">
          <div className="flex flex-col gap-5">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {SITE.promise} A personalized roadmap from zero knowledge to skilled
              tech professional.
            </p>
            <div className="flex items-center gap-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/55 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:text-white"
                >
                  <social.icon className="size-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="flex flex-col gap-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                  {column.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={column.title + link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-white/60 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Divider className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-white/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-emerald-400" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}
