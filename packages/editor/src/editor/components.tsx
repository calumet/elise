import type { PlateElementProps, PlateLeafProps } from "platejs/react";
import * as React from "react";

import type { EditorNode } from "../types";
import { markView, views } from "../views";

const element =
  (type: string) =>
  ({ attributes, children, element: node }: PlateElementProps): React.JSX.Element => {
    const View = views[type] as (typeof views)[string];
    return (
      <View element={node as unknown as EditorNode} attributes={attributes} editing>
        {children}
      </View>
    );
  };

const mark =
  (name: "bold" | "italic" | "code") =>
  ({ attributes, children }: PlateLeafProps): React.JSX.Element =>
    markView(name, children, attributes);

export const components: Record<string, (props: never) => React.ReactNode> = Object.fromEntries([
  ...Object.keys(views).map((type) => [type, element(type)]),
  ...(["bold", "italic", "code"] as const).map((name) => [name, mark(name)]),
]);
