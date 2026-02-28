import { Button } from "@calumet/elise-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@calumet/elise-ui/dialog";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@calumet/elise-ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@calumet/elise-ui/popover";
import { ThemeProvider, useTheme } from "@calumet/elise-ui/theme";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@calumet/elise-ui/tooltip";
import { AlertHost } from "@calumet/elise-utils/alerts";
import { Toaster } from "@calumet/elise-utils/toasts";
import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import { SectionCard } from "./components/SectionCard";

const AccordionCollapsibleDemo = React.lazy(() => import("./sections/AccordionCollapsibleDemo"));
const AlertDialogStandalone = React.lazy(() => import("./sections/AlertDialogStandalone"));
const CommandDemo = React.lazy(() => import("./sections/CommandDemo"));
const ComponentsSampler = React.lazy(() => import("./sections/ComponentsSampler"));
const ContactForm = React.lazy(() => import("./sections/ContactForm"));
const DataTableDemo = React.lazy(() => import("./sections/DataTableDemo"));
const DatePickersDemo = React.lazy(() => import("./sections/DatePickersDemo"));
const DialogsDemo = React.lazy(() => import("./sections/DialogsDemo"));
const FormControlsDemo = React.lazy(() => import("./sections/FormControlsDemo"));
const HelloWorld = React.lazy(() => import("./sections/HelloWorld"));
const LoginCard = React.lazy(() => import("./sections/LoginCard"));
const MediaCardDemo = React.lazy(() => import("./sections/MediaCardDemo"));
const MenusHoverDemo = React.lazy(() => import("./sections/MenusHoverDemo"));
const MenusSelectDemo = React.lazy(() => import("./sections/MenusSelectDemo"));
const ProgressSkeletonDemo = React.lazy(() => import("./sections/ProgressSkeletonDemo"));
const ScrollToolbarDemo = React.lazy(() => import("./sections/ScrollToolbarDemo"));
const TableDemo = React.lazy(() => import("./sections/TableDemo"));
const ToastDemo = React.lazy(() => import("./sections/ToastDemo"));

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Tema</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="px-3"
      >
        {theme === "dark" ? "Light" : "Dark"}
      </Button>
    </div>
  );
};

const SectionFallback = () => <div className="min-h-[220px] w-full animate-pulse rounded-sm bg-muted" />;

const LazySection = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense fallback={<SectionFallback />}>{children}</React.Suspense>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="max-w-6xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Elise UI Showcase</h1>
            <p className="text-muted-foreground">
              Ejemplos rapidos usando Radix + Tailwind con el design system.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <NavigationMenu className="justify-start">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Explorar</NavigationMenuTrigger>
              <NavigationMenuContent className="p-3">
                <div className="grid sm:w-[300px]">
                  <NavigationMenuLink asChild>
                    <a href="#hello">
                      <h3 className="text-sm font-semibold">Hello World</h3>
                      <p className="text-xs text-muted-foreground">Primer componente de ejemplo.</p>
                    </a>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <a href="#contact">
                      <h3 className="text-sm font-semibold">Contacto</h3>
                      <p className="text-xs text-muted-foreground">
                        Formulario con inputs y text area.
                      </p>
                    </a>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <a href="#components">
                      <h3 className="text-sm font-semibold">Sampler</h3>
                      <p className="text-xs text-muted-foreground">
                        Tabs, popover, progress y mas.
                      </p>
                    </a>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <a href="#login">
                      <h3 className="text-sm font-semibold">Login Card</h3>
                      <p className="text-xs text-muted-foreground">Ejemplo de tarjeta simple.</p>
                    </a>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuIndicator />
        </NavigationMenu>

        <main className="flex flex-col flex-1 gap-8 pb-12">
          <SectionCard title="Date Picker & Range">
            <LazySection>
              <DatePickersDemo />
            </LazySection>
          </SectionCard>

          <SectionCard
            id="hello"
            title="Hello world rapido con botones y tooltip."
            action={
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" className="whitespace-nowrap">
                      Ver en accion
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Simple demo de componentes basicos.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            }
          >
            <div className="flex items-center justify-center min-h-[260px] relative">
              <LazySection>
                <HelloWorld />
              </LazySection>
            </div>
          </SectionCard>

          <SectionCard
            id="contact"
            title="Formulario de contacto con validacion minima."
            action={
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline" className="whitespace-nowrap">
                    Ver codigo
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 text-sm">
                  Usa inputs, textarea, checkbox y submit con estado local.
                </PopoverContent>
              </Popover>
            }
          >
            <div className="flex items-center justify-center min-h-80 relative">
              <LazySection>
                <ContactForm />
              </LazySection>
            </div>
          </SectionCard>

          <SectionCard
            id="components"
            title="Component sampler: Tabs, Progress, Dialog, Toast."
            action={
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="whitespace-nowrap">
                    Abrir modal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog ligero</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">
                    Usa Radix Dialog con estilos base del preset.
                  </p>
                </DialogContent>
              </Dialog>
            }
          >
            <div className="flex justify-center min-h-80 relative">
              <LazySection>
                <ComponentsSampler />
              </LazySection>
            </div>
          </SectionCard>

          <SectionCard title="Dialog & Alert Dialog">
            <LazySection>
              <DialogsDemo />
            </LazySection>
          </SectionCard>

          <SectionCard title="Alert Dialog (standalone)">
            <LazySection>
              <AlertDialogStandalone />
            </LazySection>
          </SectionCard>

          <SectionCard title="Accordion & Collapsible">
            <LazySection>
              <AccordionCollapsibleDemo />
            </LazySection>
          </SectionCard>

          <SectionCard title="Progress & Skeleton">
            <LazySection>
              <ProgressSkeletonDemo />
            </LazySection>
          </SectionCard>

          <SectionCard title="Menubar, Context Menu y Select">
            <LazySection>
              <MenusSelectDemo />
            </LazySection>
          </SectionCard>

          <SectionCard title="Dropdown & Hover Card">
            <LazySection>
              <MenusHoverDemo />
            </LazySection>
          </SectionCard>

          <SectionCard title="Form controls (Radio, Switch, Slider)">
            <LazySection>
              <FormControlsDemo />
            </LazySection>
          </SectionCard>

          <SectionCard title="Media Card, Avatar y Aspect Ratio">
            <LazySection>
              <MediaCardDemo />
            </LazySection>
          </SectionCard>

          <SectionCard title="Command Palette">
            <LazySection>
              <CommandDemo />
            </LazySection>
          </SectionCard>

          <SectionCard title="Table">
            <LazySection>
              <TableDemo />
            </LazySection>
          </SectionCard>

          <SectionCard title="Data Table (filtros y exportacion)">
            <LazySection>
              <DataTableDemo />
            </LazySection>
          </SectionCard>

          <SectionCard title="Scroll & Toolbar">
            <LazySection>
              <ScrollToolbarDemo />
            </LazySection>
          </SectionCard>

          <SectionCard title="Toast">
            <LazySection>
              <ToastDemo />
            </LazySection>
          </SectionCard>

          <SectionCard id="login" title="Tarjeta de login simple.">
            <div className="flex items-center justify-center min-h-[260px] relative">
              <LazySection>
                <LoginCard />
              </LazySection>
            </div>
          </SectionCard>
        </main>
      </div>
      <Toaster />
      <AlertHost />
    </ThemeProvider>
  </React.StrictMode>,
);
