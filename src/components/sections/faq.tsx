import { MessageCircleQuestion } from "lucide-react";

import { Section, SectionHeading } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/data/faqs";

export function Faq() {
  return (
    <Section id="faq" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            align="left"
            eyebrow="FAQ"
            title={
              <>
                The questions{" "}
                <span className="text-gradient-brand">every beginner asks.</span>
              </>
            }
            description="Straight answers, no upsell. If something isn't covered here, our team replies to every message."
          />

          <Reveal delay={0.15} className="mt-8">
            <Button variant="secondary" asChild>
              <a href="#cta">
                <MessageCircleQuestion />
                Ask us anything
              </a>
            </Button>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {FAQS.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </Section>
  );
}
