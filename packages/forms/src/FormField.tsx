import { Field, type FieldControlProps, type FieldProps } from "@calumet/elise-ui/field";
import * as React from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
} from "react-hook-form";

export type FormFieldBinding<TValue = unknown> = Partial<FieldControlProps> & {
  name: string;
  value: TValue;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  ref: (instance: unknown) => void;
};

export type FormFieldState = {
  error: string | undefined;
};

export type FormFieldRender<TValue = unknown> = (
  field: FormFieldBinding<TValue>,
  state: FormFieldState,
) => React.ReactNode;

type LabelledProps = Omit<FieldProps, "children" | "error">;

export type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = {
  form: { control: Control<TFieldValues, unknown, TTransformedValues> };
  name: TName;
} & (
  | (LabelledProps & {
      children:
        | React.ReactElement<Record<string, unknown>>
        | FormFieldRender<FieldPathValue<TFieldValues, TName>>;
    })
  | {
      label?: undefined;
      children: FormFieldRender<FieldPathValue<TFieldValues, TName>>;
    }
);

/**
 * Un campo conectado a un formulario de `useZodForm`. Con `label` pinta un
 * `Field` con el error del esquema; sin `label` solo conecta, para los controles
 * que ya traen rótulo y error, como `Checkbox`.
 */
export function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(props: FormFieldProps<TFieldValues, TName, TTransformedValues>): React.ReactNode {
  const { form, name, children, ...fieldProps } = props;
  const { field, fieldState } = useController({ control: form.control, name });
  const state: FormFieldState = { error: fieldState.error?.message };

  const render = (control?: FieldControlProps): React.ReactNode => {
    const binding = {
      ...control,
      name: field.name,
      value: field.value,
      onChange: field.onChange,
      onBlur: field.onBlur,
      ref: field.ref,
    };
    return typeof children === "function"
      ? children(binding, state)
      : React.cloneElement(children, binding);
  };

  if (fieldProps.label === undefined) return render();

  return (
    <Field {...(fieldProps as LabelledProps)} error={state.error}>
      {render}
    </Field>
  );
}
