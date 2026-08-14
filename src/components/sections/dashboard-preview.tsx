import {
  Check,
  FolderGit2,
  GitBranch,
  LayoutDashboard,
  type LucideIcon,
  Map,
  Route,
  Sparkles,
  Target,
  Terminal,
} from "lucide-react";

import { Section, SectionHeading } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { LogoMark } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

interface SidebarEntry {
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

const SIDEBAR: SidebarEntry[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "My Journey", icon: Route },
  { label: "Roadmap", icon: Map },
  { label: "Practice", icon: Terminal },
  { label: "Projects", icon: FolderGit2 },
  { label: "AI Tools", icon: Sparkles },
  { label: "Git & GitHub", icon: GitBranch },
];

const PROGRESS = 72;

/**
 * A larger, static rendering of the future product. Deliberately a Server
 * Component — it is a picture of an app, not an app, so it ships no JS beyond
 * the entrance animation on its wrapper.
 */
export function DashboardPreview() {
  return (
    <Section id="dashboard">
      <Container>
        <SectionHeading
          eyebrow="Product preview"
          title="Everything in one place."
          description="Where CodeCompass is heading: your path, your current mission, and what to do next — without hunting for it."
        />

        <Reveal delay={0.1} className="mt-16">
          <div className="panel overflow-hidden rounded-2xl">
            <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
              {/* Sidebar — hidden below lg, where it would only crowd the view. */}
              <aside className="hidden flex-col gap-6 border-r border-border p-5 lg:flex">
                <div className="flex items-center gap-2.5">
                  <LogoMark className="size-7" />
                  <span className="text-sm font-medium tracking-tight text-foreground">
                    CodeCompass
                  </span>
                </div>

                <nav aria-label="Product preview navigation">
                  <ul className="flex flex-col gap-0.5">
                    {SIDEBAR.map((entry) => (
                      <li key={entry.label}>
                        <span
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px]",
                            entry.active
                              ? "bg-surface-raised text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          <entry.icon className="size-4" aria-hidden />
                          {entry.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>

              {/* Main */}
              <div className="min-w-0 p-5 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-subtle-foreground">Welcome back</p>
                    <p className="mt-1 truncate text-xl font-semibold tracking-tight text-foreground">
                      Frontend Developer
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm text-subtle-foreground">Progress</p>
                    <p className="font-mono text-xl font-semibold text-foreground">
                      {PROGRESS}%
                    </p>
                  </div>
                </div>

                <div
                  className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-raised"
                  role="progressbar"
                  aria-valuenow={PROGRESS}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Overall path progress"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${PROGRESS}%` }}
                  />
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                  <div className="flex flex-col gap-4">
                    {/* Current mission */}
                    <div className="rounded-xl border border-primary/25 bg-primary/[0.07] p-5">
                      <p className="flex items-center gap-2 text-xs uppercase tracking-label text-indigo-300">
                        <Target className="size-3.5" aria-hidden />
                        Current Mission
                      </p>
                      <p className="mt-2 text-base font-medium text-foreground">
                        Master JavaScript Promises
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Asynchronous JavaScript · 4 of 7 lessons
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-surface/60 p-5">
                      <p className="text-xs uppercase tracking-label text-subtle-foreground">
                        Upcoming
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        Async / Await
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Unlocks once Promises is complete.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="rounded-xl border border-border bg-surface/60 p-5">
                      <p className="text-xs uppercase tracking-label text-subtle-foreground">
                        Projects
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-surface">
                          <FolderGit2 className="size-4 text-cyan-400" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">
                            Weather App
                          </span>
                          <span className="block text-xs text-subtle-foreground">
                            In progress
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-surface/60 p-5">
                      <p className="text-xs uppercase tracking-label text-subtle-foreground">
                        Recent Activity
                      </p>
                      <div className="mt-3 flex items-start gap-2.5">
                        <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-emerald-500/15">
                          <Check className="size-2.5 text-emerald-400" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm text-muted-foreground">
                            Completed JavaScript Functions
                          </span>
                          <span className="block font-mono text-xs text-subtle-foreground">
                            2 hours ago
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
