import { Eye, PencilLine } from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";
import type { Range } from "platejs";
import { useEditorRef, useEditorSelector } from "platejs/react";
import * as React from "react";

import { useLabels } from "../labels";
import { EditorContent } from "../render/content";
import type { EditorNode } from "../types";
import { useServices } from "./context";
import { motionOptions, reducedMotion } from "./motion";
import { BlockSelectionPlugin, selectBlockById } from "./selection";

export type EditorPreview = {
  previewing: boolean;
  preview: () => void;
  edit: () => void;
};

type PreviewState = EditorPreview & { locale: string };

const PreviewContext = React.createContext<PreviewState | null>(null);

const IDLE: EditorPreview = { previewing: false, preview: () => {}, edit: () => {} };

export const useEditorPreview = (): EditorPreview => React.useContext(PreviewContext) ?? IDLE;

export const usePreviewing = (): boolean => React.useContext(PreviewContext)?.previewing ?? false;

export const PreviewProvider = ({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}): React.JSX.Element => {
  const editor = useEditorRef();
  const [previewing, setPreviewing] = React.useState(false);
  const saved = React.useRef<{ selection: Range | null; block: string | null } | null>(null);
  const pending = React.useRef<{ after?: () => void; fade: boolean; done?: () => void } | null>(
    null,
  );

  React.useLayoutEffect(() => {
    const job = pending.current;
    if (!job) return;
    pending.current = null;
    job.after?.();
    const shell = editor.api.toDOMNode(editor)?.closest<HTMLElement>('[data-slot="editor"]');
    if (job.fade) shell?.animate([{ opacity: 0 }, { opacity: 1 }], motionOptions(shell));
    job.done?.();
  }, [editor, previewing]);

  const swap = React.useCallback((next: boolean, after?: () => void) => {
    if (!reducedMotion() && document.startViewTransition) {
      document.startViewTransition(
        () =>
          new Promise<void>((done) => {
            pending.current = { after, fade: false, done };
            setPreviewing(next);
          }),
      );
      return;
    }
    pending.current = { after, fade: true };
    setPreviewing(next);
  }, []);

  const preview = React.useCallback(() => {
    saved.current = {
      selection: editor.selection,
      block: editor.getOption(BlockSelectionPlugin, "id"),
    };
    editor.tf.blur();
    swap(true);
  }, [editor, swap]);

  const edit = React.useCallback(() => {
    const previous = saved.current;
    saved.current = null;
    swap(false, () => {
      if (previous?.block) {
        selectBlockById(editor, previous.block);
      } else if (previous?.selection) {
        editor.tf.select(previous.selection);
        editor.tf.focus();
      }
    });
  }, [editor, swap]);

  React.useEffect(() => {
    if (!previewing) return;
    const leave = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) edit();
    };
    window.addEventListener("keydown", leave);
    return () => window.removeEventListener("keydown", leave);
  }, [previewing, edit]);

  const value = React.useMemo(
    () => ({ previewing, preview, edit, locale }),
    [previewing, preview, edit, locale],
  );
  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>;
};

export const PreviewDocument = (): React.JSX.Element => {
  const { schema } = useServices();
  const locale = React.useContext(PreviewContext)?.locale ?? "";
  const content = useEditorSelector((editor) => editor.children, []) as unknown as EditorNode[];
  return <EditorContent value={{ version: 1, locale, content }} schema={schema} />;
};

export type EditorPreviewButtonProps = { className?: string };

export const EditorPreviewButton = ({ className }: EditorPreviewButtonProps): React.JSX.Element => {
  const t = useLabels();
  const { previewing, preview, edit } = useEditorPreview();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      data-slot="editor-preview-button"
      aria-pressed={previewing}
      className={`aria-pressed:bg-accent aria-pressed:text-accent-foreground ${className ?? ""}`.trim()}
      onClick={previewing ? edit : preview}
    >
      {previewing ? <PencilLine aria-hidden="true" /> : <Eye aria-hidden="true" />}
      {previewing ? t.backToEditing : t.preview}
    </Button>
  );
};
