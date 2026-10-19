import { PlateContent } from "platejs/react";
import * as React from "react";

import { useLabels } from "../labels";
import { useServices } from "./context";
import type { InsertItem } from "./items";
import { useSlashMenu, type SlashMenuState } from "./slash-menu";

export type EditorContentAreaProps = {
  placeholder?: string;
  className?: string;
  renderSlashMenu?: (menu: SlashMenuState) => React.ReactNode;
  onSlashPick?: (item: InsertItem) => void;
};

export const EditorContentArea = ({
  placeholder,
  className,
  renderSlashMenu,
  onSlashPick,
}: EditorContentAreaProps): React.JSX.Element => {
  const t = useLabels();
  const { schema } = useServices();
  const menu = useSlashMenu(onSlashPick);
  const hint =
    placeholder ?? (schema.blocks.length > 2 ? t.placeholderDocument : t.placeholderMessage);

  return (
    <>
      <PlateContent placeholder={hint} onKeyDown={menu.onKeyDown} className={className} />
      {renderSlashMenu?.(menu)}
    </>
  );
};
