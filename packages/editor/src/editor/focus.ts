import { useEditorRef } from "platejs/react";
import * as React from "react";

export const useEditorFocused = (): boolean => {
  const editor = useEditorRef();
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    const root = editor.api.toDOMNode(editor);
    if (!root) return;
    const enter = () => setFocused(true);
    const leave = (event: FocusEvent) =>
      setFocused(event.relatedTarget instanceof Node && root.contains(event.relatedTarget));
    root.addEventListener("focusin", enter);
    root.addEventListener("focusout", leave);
    return () => {
      root.removeEventListener("focusin", enter);
      root.removeEventListener("focusout", leave);
    };
  }, [editor]);

  return focused;
};

export const focusMovedOn = (event: Event): boolean => {
  const active = document.activeElement;
  const menu = active?.closest("[role=menu]");
  return Boolean(menu && event.target instanceof Node && !event.target.contains(menu));
};
