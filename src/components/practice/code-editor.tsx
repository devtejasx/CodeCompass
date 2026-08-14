"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { OnMount } from "@monaco-editor/react";

import { MONACO_LANGUAGE } from "@/lib/practice/languages";
import type { CodeLanguage } from "@/generated/prisma/client";

/**
 * The code editor.
 *
 * Monaco is loaded with next/dynamic and ssr:false, so it is fetched only when
 * a problem page is opened — no other route pays for it. The `loading` state is
 * a real textarea rather than a spinner: if Monaco is slow, or blocked, a
 * learner can still type and still submit.
 */
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

/** Matches the code-block surface used elsewhere, so code reads the same everywhere. */
const THEME_NAME = "codecompass-dark";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: CodeLanguage;
  /** Ctrl/Cmd + Enter. */
  onRun?: () => void;
  /** Ctrl/Cmd + Shift + Enter. */
  onSubmit?: () => void;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language,
  onRun,
  onSubmit,
  readOnly = false,
}: CodeEditorProps) {
  // Held in refs so re-binding a shortcut never needs to remount the editor.
  const runRef = React.useRef(onRun);
  const submitRef = React.useRef(onSubmit);
  runRef.current = onRun;
  submitRef.current = onSubmit;

  /*
   * The options object is memoised because @monaco-editor/react diffs it by
   * identity and calls `editor.updateOptions` whenever it changes.
   *
   * Built inline, it was a new object on every render — and this component
   * re-renders on every keystroke, because the buffer it displays is state in
   * the workspace above it. So each character typed also pushed a full
   * configuration update into Monaco: re-resolving the font, the tab size, the
   * scrollbar sizes, bracket colourisation. Nothing visibly broke, which is why
   * it survived; it was simply a pile of work per keypress that nothing asked
   * for.
   *
   * Only `readOnly` and the two language-derived values can actually change,
   * so those are the dependencies. Everything else is constant by construction.
   */
  const options = React.useMemo(
    () => ({
      readOnly,
      fontSize: 13.5,
      fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
      fontLigatures: false,
      lineNumbers: "on" as const,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      padding: { top: 14, bottom: 14 },
      tabSize: language === "PYTHON" ? 4 : 2,
      insertSpaces: true,
      automaticLayout: true,
      renderLineHighlight: "line" as const,
      bracketPairColorization: { enabled: true },
      scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
      // Tab moves focus until the learner opts in with Ctrl+M, so the
      // editor never becomes a keyboard trap on the way to the Run button.
      tabFocusMode: true,
      ariaLabel: "Code editor. Press Control M to toggle tab trapping.",
      quickSuggestions: { other: true, comments: false, strings: false },
      suggestOnTriggerCharacters: true,
      wordBasedSuggestions: "currentDocument" as const,
    }),
    [language, readOnly],
  );

  const handleMount: OnMount = (editor, monaco) => {
    monaco.editor.defineTheme(THEME_NAME, {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0B0B0F",
        "editorGutter.background": "#0B0B0F",
        "editor.lineHighlightBackground": "#FFFFFF08",
        "editorLineNumber.foreground": "#52525B",
        "editorLineNumber.activeForeground": "#A1A1AA",
        "editor.selectionBackground": "#4F46E559",
        "editorIndentGuide.background1": "#FFFFFF10",
      },
    });
    monaco.editor.setTheme(THEME_NAME);

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () =>
      runRef.current?.(),
    );
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      () => submitRef.current?.(),
    );
  };

  return (
    <div className="h-full min-h-[18rem] overflow-hidden rounded-lg border border-border bg-[#0B0B0F]">
      <MonacoEditor
        // Remounting per language is intentional: it resets the model so
        // TypeScript diagnostics never linger on a Python buffer.
        key={language}
        height="100%"
        theme={THEME_NAME}
        language={MONACO_LANGUAGE[language]}
        value={value}
        onChange={(next) => onChange(next ?? "")}
        onMount={handleMount}
        options={options}
        loading={<EditorSkeleton />}
      />
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="grid h-full min-h-[18rem] place-items-center bg-[#0B0B0F] p-6">
      <p className="font-mono text-xs text-subtle-foreground">Loading editor…</p>
    </div>
  );
}
