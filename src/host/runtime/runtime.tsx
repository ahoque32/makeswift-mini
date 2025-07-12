import type { ReactNode } from "react";
import { Box } from "../components/Box";
import { Text } from "../components/Text";

export const COMPONENT_TYPE = {
  Box: "Box",
  Text: "Text",
} as const;

type Box = {
  key: string;
  type: typeof COMPONENT_TYPE.Box;
  props: {
    padding?: number;
    width?: number;
    backgroundColor?: string;
    children?: Component[];
  };
};

type Text = {
  key: string;
  type: typeof COMPONENT_TYPE.Text;
  props: {
    color?: string;
    fontSize?: number;
    fontWeight?: number;
    text?: string;
  };
};

export type Component = Box | Text;

export function renderComponent(component: Component, editMode: boolean = false): ReactNode {
  let rendered: ReactNode;
  switch (component.type) {
    case COMPONENT_TYPE.Box: {
      const { children, ...props } = component.props;

      rendered = (
        <Box key={component.key} {...props}>
          {children?.map((c) => renderComponent(c, editMode))}
        </Box>
      );
      break;
    }
    case COMPONENT_TYPE.Text:
      rendered = <Text key={component.key} {...component.props} />;
      break;
    default:
      rendered = null;
  }

  if (editMode) {
    return (
      <div key={`${component.key}-wrapper`} data-component-id={component.key} style={{ display: "contents" }}>
        {rendered}
      </div>
    );
  } else {
    return rendered;
  }
}
