import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { Divider } from "@/components/shared/backdrops";
import { FOOTER_GROUPS, SITE, SOCIAL_LINKS } from "@/lib/data/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <Container>
        <div className="grid gap-12 py-16 lg:grid-cols-[1.5fr_2fr]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {SITE.footerBlurb}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <h2 className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
                  {group.title}
                </h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {group.links.map((link) => (
                    <li key={group.title + link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h2 className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
                Social
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {SOCIAL_LINKS.map((social) => {
                  /*
                   * Phase 1 has no social accounts yet. Rendering these as
                   * href="#" would be a link that yanks the reader back to the
                   * top, so an unset destination renders as plain text instead.
                   * Filling in the URL in SOCIAL_LINKS turns it into a link.
                   */
                  const pending = social.href === "#";
                  const content = (
                    <>
                      <social.icon className="size-4" aria-hidden />
                      {social.label}
                    </>
                  );

                  return (
                    <li key={social.label}>
                      {pending ? (
                        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          {content}
                        </span>
                      ) : (
                        <a
                          href={social.href}
                          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                        >
                          {content}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <Divider />

        <div className="py-6">
          <p className="text-sm text-subtle-foreground">
            © 2026 {SITE.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
