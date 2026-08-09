import {
  BarChart3,
  Blocks,
  Bot,
  Boxes,
  BrainCircuit,
  Bug,
  Cloud,
  Code2,
  Compass,
  Cpu,
  Database,
  Gamepad2,
  HardDrive,
  Layers,
  LineChart,
  type LucideIcon,
  Network,
  PenTool,
  Server,
  ShieldCheck,
  Smartphone,
  Workflow,
} from "lucide-react";

/**
 * A database row can't carry a React component, so careers store an icon
 * *name* and it is resolved here.
 *
 * Every icon is imported explicitly: a name that isn't in this map falls back
 * to the compass rather than crashing or rendering an empty box, and adding a
 * career with a new icon is a one-line change here.
 */
const CAREER_ICONS: Record<string, LucideIcon> = {
  BarChart3,
  Blocks,
  Bot,
  Boxes,
  BrainCircuit,
  Bug,
  Cloud,
  Code2,
  Cpu,
  Database,
  Gamepad2,
  HardDrive,
  Layers,
  LineChart,
  Network,
  PenTool,
  Server,
  ShieldCheck,
  Smartphone,
  Workflow,
};

export function careerIcon(name: string): LucideIcon {
  return CAREER_ICONS[name] ?? Compass;
}
