import {
  Bot,
  BookOpen,
  Code2,
  Cpu,
  Github,
  Heart,
  LayoutTemplate,
  type LucideIcon,
  MessageSquare,
  MousePointer2,
  Play,
  Plug,
  Route,
  Search,
  Sparkles,
  Star,
  Terminal,
  Wind,
  Workflow,
  Zap,
} from "lucide-react";

/**
 * A database row can't carry a React component, so AI tools and categories
 * store an icon *name* and it is resolved here.
 *
 * These are deliberately generic glyphs rather than product logos. Brand assets
 * carry licences, and an unofficial or approximated logo is worse than a clean
 * icon — it misrepresents a company using its own identity. A tool's name is
 * always shown in text beside the glyph, so nothing depends on recognising it.
 *
 * An unknown name falls back to the sparkle rather than crashing or rendering
 * an empty box.
 */
const AI_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Bot,
  Code2,
  Cpu,
  Github,
  Heart,
  LayoutTemplate,
  MessageSquare,
  MousePointer2,
  Play,
  Plug,
  Route,
  Search,
  Sparkles,
  Star,
  Terminal,
  Wind,
  Workflow,
  Zap,
};

export function aiToolIcon(name: string): LucideIcon {
  return AI_ICONS[name] ?? Sparkles;
}
