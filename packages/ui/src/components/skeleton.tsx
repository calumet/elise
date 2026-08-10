/**
 * El hueco que ocupa un contenido mientras carga. Lleva `aria-busy`, así que el lector de pantalla no lo anuncia como contenido.
 *
 * @module
 */

import * as React from "react";

import { cn } from "@/lib/cn";

/** Props de {@link Skeleton}. */
export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/** El hueco que ocupa un contenido mientras carga. Lleva `aria-busy`, así que el lector de pantalla no lo anuncia como contenido. */
export const Skeleton: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SkeletonProps> & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, SkeletonProps>(({ className, ...props }, ref) => (
  <div
    data-slot="skeleton"
    ref={ref}
    className={cn("animate-pulse rounded-sm bg-muted", className)}
    aria-busy="true"
    {...props}
  />
));

Skeleton.displayName = "Skeleton";
