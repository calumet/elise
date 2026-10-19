import { Eye, PencilLine } from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";
import type { Range } from "platejs";
import { useEditorRef, useEditorSelector } from "platejs/react";
import * as React from "react";

import { useLabels } from "../labels";
import { EditorContent } from "../render/content";
import type { EditorNode } from "../types";
import { useServices } from "./context";
import { useDocument, useMode, type EditorMode } from "./modes";
import { motionOptions, reducedMotion } from "./motion";
import { BlockSelectionPlugin, selectBlockById } from "./selection";

export type EditorPreview = {
  previewing: boolean;
  preview: () => void;
  edit: () => void;
  device: "desktop" | "mobile";
  setDevice: (device: "desktop" | "mobile") => void;
};

type PreviewState = EditorPreview & {
  locale: string;
  shown: string;
  previewIn: (locale: string) => void;
};

const PreviewContext = React.createContext<PreviewState | null>(null);

const IDLE: EditorPreview = {
  previewing: false,
  preview: () => {},
  edit: () => {},
  device: "desktop",
  setDevice: () => {},
};

export const useDevice = (): EditorPreview["device"] =>
  React.useContext(PreviewContext)?.device ?? "desktop";

export const useEditorPreview = (): EditorPreview => React.useContext(PreviewContext) ?? IDLE;

export const usePreviewing = (): boolean => React.useContext(PreviewContext)?.previewing ?? false;

export const usePreviewIn = (): ((locale: string) => void) =>
  React.useContext(PreviewContext)?.previewIn ?? (() => {});

export const PreviewProvider = ({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}): React.JSX.Element => {
  const editor = useEditorRef();
  const { mode, setMode } = useMode();
  const [previewing, setPreviewing] = React.useState(false);
  const [picked, setShown] = React.useState<string | null>(null);
  const shown = picked ?? locale;
  const returnTo = React.useRef<EditorMode>("visual");
  const [device, setDevice] = React.useState<EditorPreview["device"]>("desktop");
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
      document
        .startViewTransition(
          () =>
            new Promise<void>((done) => {
              pending.current = { after, fade: false, done };
              setPreviewing(next);
            }),
        )
        .ready.catch(() => {});
      return;
    }
    pending.current = { after, fade: true };
    setPreviewing(next);
  }, []);

  const previewIn = React.useCallback(
    (target: string) => {
      returnTo.current = mode;
      setShown(target);
      if (mode !== "visual") {
        setMode("visual");
        setPreviewing(true);
        return;
      }
      saved.current = {
        selection: editor.selection,
        block: editor.getOption(BlockSelectionPlugin, "id"),
      };
      editor.tf.blur();
      swap(true);
    },
    [editor, swap, mode, setMode],
  );

  const preview = React.useCallback(() => previewIn(locale), [previewIn, locale]);

  const edit = React.useCallback(() => {
    const previous = saved.current;
    saved.current = null;
    if (returnTo.current !== "visual") {
      const back = returnTo.current;
      returnTo.current = "visual";
      setPreviewing(false);
      setMode(back);
      return;
    }
    swap(false, () => {
      if (previous?.block) {
        selectBlockById(editor, previous.block);
      } else if (previous?.selection) {
        editor.tf.select(previous.selection);
        editor.tf.focus();
      }
    });
  }, [editor, swap, setMode]);

  React.useEffect(() => {
    if (!previewing) return;
    const leave = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) edit();
    };
    window.addEventListener("keydown", leave);
    return () => window.removeEventListener("keydown", leave);
  }, [previewing, edit]);

  const value = React.useMemo(
    () => ({ previewing, preview, edit, device, setDevice, locale, shown, previewIn }),
    [previewing, preview, edit, device, locale, shown, previewIn],
  );
  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>;
};

export const PreviewArea = ({ page }: { page: boolean }): React.JSX.Element => {
  const { schema } = useServices();
  const { value } = useDocument();
  const state = React.useContext(PreviewContext);
  const content = useEditorSelector((editor) => editor.children, []) as unknown as EditorNode[];
  return (
    <div
      data-slot="editor-preview"
      data-device={page ? (state?.device ?? "desktop") : undefined}
      className={page ? "@container/editor-page" : undefined}
    >
      <EditorContent value={{ ...value, content }} locale={state?.shown} schema={schema} />
    </div>
  );
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
      <span className="grid justify-items-center">
        <span className="[grid-area:1/1]">{previewing ? t.backToEditing : t.preview}</span>
        <span aria-hidden="true" className="invisible [grid-area:1/1]">
          {previewing ? t.preview : t.backToEditing}
        </span>
      </span>
    </Button>
  );
};
