"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { SimCommit, SimState } from "@/lib/git/simulator/types";

/**
 * A commit graph, drawn with SVG.
 *
 * No graph library: this is circles, lines and text, and pulling in a rendering
 * engine to draw thirty nodes would be a lot of bytes for something a hundred
 * lines of SVG does better.
 *
 * Accessibility is the reason the list underneath exists. Lines and colours
 * communicate nothing to a screen reader, so the same structure is also emitted
 * as an ordered list describing each commit, its branch and its parents. The
 * SVG is aria-hidden; the list is the real content.
 */

const ROW = 44;
const LANE = 34;
const LEFT = 22;
const TOP = 22;

export function GitGraph({
  state,
  className,
}: {
  state: SimState;
  className?: string;
}) {
  const { nodes, lanes } = React.useMemo(() => layout(state), [state]);

  if (nodes.length === 0) {
    return (
      <p className={cn("text-sm text-subtle-foreground", className)}>
        No commits yet. The graph appears once there is history to draw.
      </p>
    );
  }

  const height = TOP * 2 + (nodes.length - 1) * ROW;
  const width = LEFT * 2 + (lanes.length - 1) * LANE + 200;

  return (
    <div className={className}>
      {/* Scrolls inside itself; the page never scrolls sideways. */}
      <div className="overflow-x-auto">
        <svg
          width={Math.max(width, 280)}
          height={height}
          viewBox={`0 0 ${Math.max(width, 280)} ${height}`}
          aria-hidden
          className="min-w-full"
        >
          {nodes.map((node) =>
            node.parents.map((parent) => {
              const from = nodes.find((entry) => entry.id === parent);
              if (!from) return null;

              const x1 = LEFT + node.lane * LANE;
              const y1 = TOP + node.row * ROW;
              const x2 = LEFT + from.lane * LANE;
              const y2 = TOP + from.row * ROW;

              // A curve when the lanes differ, a straight line when they don't.
              const path =
                x1 === x2
                  ? `M ${x1} ${y1} L ${x2} ${y2}`
                  : `M ${x1} ${y1} C ${x1} ${y1 + ROW / 2}, ${x2} ${y2 - ROW / 2}, ${x2} ${y2}`;

              return (
                <path
                  key={`${node.id}-${parent}`}
                  d={path}
                  fill="none"
                  stroke={laneColour(Math.max(node.lane, from.lane))}
                  strokeWidth={1.5}
                  strokeOpacity={0.5}
                />
              );
            }),
          )}

          {nodes.map((node) => {
            const x = LEFT + node.lane * LANE;
            const y = TOP + node.row * ROW;

            return (
              <g key={node.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={node.isMerge ? 7 : 5.5}
                  fill="#09090B"
                  stroke={laneColour(node.lane)}
                  strokeWidth={node.isMerge ? 2.5 : 2}
                />
                <text
                  x={x + 16}
                  y={y + 4}
                  className="fill-current font-mono text-[11px] text-subtle-foreground"
                >
                  {node.shortSha}
                </text>
                <text
                  x={x + 74}
                  y={y + 4}
                  className="fill-current text-[12px] text-muted-foreground"
                >
                  {truncate(node.message, 34)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Branch key, in words as well as colour. */}
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {lanes.map((branch, index) => (
          <li key={branch} className="flex items-center gap-1.5 text-xs">
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ backgroundColor: laneColour(index) }}
            />
            <span className="font-mono text-muted-foreground">{branch}</span>
            {state.head === branch ? (
              <span className="text-subtle-foreground">(current)</span>
            ) : null}
          </li>
        ))}
      </ul>

      {/*
        The accessible equivalent. A screen reader gets nothing from the SVG, so
        the same structure is described here in text.
      */}
      <h4 className="sr-only">Commit history, described</h4>
      <ol className="sr-only">
        {nodes.map((node) => (
          <li key={node.id}>
            {node.shortSha} on branch {node.branch}: {node.message}.
            {node.isMerge
              ? " This is a merge commit with two parents."
              : node.parents.length === 0
                ? " This is the first commit; it has no parent."
                : ""}
          </li>
        ))}
      </ol>
    </div>
  );
}

interface GraphNode extends SimCommit {
  row: number;
  lane: number;
  isMerge: boolean;
}

/** Assigns each commit a row (newest first) and a lane (one per branch). */
function layout(state: SimState): { nodes: GraphNode[]; lanes: string[] } {
  const ordered = [...state.commits].reverse();
  const lanes: string[] = [];

  const nodes = ordered.map((commit, row) => {
    let lane = lanes.indexOf(commit.branch);
    if (lane === -1) {
      lanes.push(commit.branch);
      lane = lanes.length - 1;
    }

    return { ...commit, row, lane, isMerge: commit.parents.length > 1 };
  });

  return { nodes, lanes: lanes.length > 0 ? lanes : ["main"] };
}

/** Brand palette first, then distinguishable fallbacks. */
function laneColour(lane: number): string {
  const palette = ["#4F46E5", "#06B6D4", "#7C3AED", "#10B981", "#F59E0B"];
  return palette[lane % palette.length];
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}
