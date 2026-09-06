/**
 * El menú de la cuenta. `AppShellUserMenu` es este mismo componente: no depende
 * de ningún contexto, así que una cabecera de portal lo monta sin el shell.
 *
 * ```tsx
 * <UserMenu name="Juan Lipez" detail="Calumet">
 *   <DropdownMenuItem>Mi perfil</DropdownMenuItem>
 * </UserMenu>
 * ```
 *
 * @module
 */

import * as React from "react";

import { Avatar, AvatarFallback, inicialesDe } from "./avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./dropdown-menu";

import { cn } from "@/lib/cn";

/** Props de {@link UserMenu}. */
export type UserMenuProps = {
  /** Nombre de quien entró. Se esconde donde no cabe, pero sigue anunciándose. */
  name: string;

  /** Debajo del nombre dentro del menú: la organización, el correo, el rol. */
  detail?: string;

  /** Las letras del avatar, cuando las que salen del nombre no sirven. */
  initials?: string;

  /** Una foto, que sustituye a las iniciales. */
  avatar?: React.ReactNode;

  /**
   * `name` dibuja la píldora con el nombre y la pliega al avatar donde no cabe;
   * `avatar` deja el avatar suelto en cualquier ancho.
   */
  variant?: "name" | "avatar";

  className?: string;

  /** Lo que se despliega: `DropdownMenuItem` y compañía. */
  children: React.ReactNode;
};

/**
 * La cuenta, al final de una cabecera.
 *
 * Es un menú de verdad y no una ficha decorativa. Dibujada con borde y fondo
 * pide que la pulses, así que si no despliega nada el aspecto miente.
 *
 * Se pinta con tokens, así que se sostiene sobre cualquier franja que los
 * resuelva: la cabecera oscura del `AppShell`, que se marca `data-theme="dark"`,
 * y la clara de un portal. Sobre un color puesto a mano que no salga de los
 * tokens, no.
 */
function UserMenu({
  name,
  detail,
  initials,
  avatar,
  variant = "name",
  className,
  children,
}: UserMenuProps): React.JSX.Element {
  const letras = initials ?? inicialesDe(name);

  const cara = (size: "xs" | "sm") => (
    <Avatar size={size} shape="square" className="border-0">
      {avatar ?? (
        <AvatarFallback className="bg-primary font-bold text-primary-foreground">
          {letras}
        </AvatarFallback>
      )}
    </Avatar>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-slot="user-menu"
          className={cn(
            "flex h-8 flex-none cursor-pointer items-center gap-2 rounded-md text-foreground transition-[background-color,border-color] duration-(--duration-fast) ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            variant === "name" &&
              "md:border md:border-border md:bg-card md:ps-2.5 md:pe-1 md:hover:border-border-strong",
            className,
          )}
        >
          {variant === "name" ? (
            <>
              <span className="hidden max-w-32 truncate text-sm font-semibold md:inline">
                {name}
              </span>
              <span className="sr-only md:hidden">{name}</span>
            </>
          ) : (
            <span className="sr-only">{name}</span>
          )}
          {cara("xs")}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        {/* Los márgenes negativos cancelan el relleno del menú y el radio es el
            suyo menos el píxel del borde, que si no la esquina teñida asoma por
            fuera de la curva. */}
        <div className="-mx-1 -mt-1 mb-1 flex items-center gap-2.5 rounded-t-[11px] border-b border-border bg-muted px-3 py-2.5">
          {cara("sm")}
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-foreground">{name}</span>
            {detail ? (
              <span className="truncate text-xs text-muted-foreground">{detail}</span>
            ) : null}
          </span>
        </div>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
UserMenu.displayName = "UserMenu";

export { UserMenu };
