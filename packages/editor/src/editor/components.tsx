import { useSelected, type PlateElementProps, type PlateLeafProps } from "platejs/react";
import * as React from "react";

import type { EditorNode } from "../types";
import { markView, views } from "../views";
import { TableElement } from "./table-chrome";

const element =
  (type: string) =>
  ({ attributes, children, element: node }: PlateElementProps): React.JSX.Element => {
    const View = views[type] as (typeof views)[string];
    const selected = useSelected();
    const { className: _plateClass, ...rest } = attributes as typeof attributes & {
      className?: string;
    };
    return (
      <View element={node as unknown as EditorNode} attributes={rest} selected={selected} editing>
        {children}
      </View>
    );
  };

const mark =
  (name: "bold" | "italic" | "code") =>
  ({ attributes, children }: PlateLeafProps): React.JSX.Element => {
    const { className: _plateClass, ...rest } = attributes as typeof attributes & {
      className?: string;
    };
    return markView(name, children, rest);
  };

export const components: Record<string, (props: never) => React.ReactNode> = Object.fromEntries([
  ...Object.keys(views).map((type) => [type, type === "table" ? TableElement : element(type)]),
  ...(["bold", "italic", "code"] as const).map((name) => [name, mark(name)]),
]);
