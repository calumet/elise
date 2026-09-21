import { AlertHost } from "@calumet/elise-alerts";
import { I18nProvider, useTranslation } from "@calumet/elise-i18n";
import { ThemeProvider, useTheme } from "@calumet/elise-themes";
import { Toaster } from "@calumet/elise-toasts";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@calumet/elise-ui/tooltip";
import React from "react";

import { LocaleToggle } from "./components/LocaleToggle";
import { SectionCard } from "./components/SectionCard";
import { i18nConfig } from "./config";
import { messages } from "./i18n";

const AccordionCollapsibleDemo = React.lazy(() => import("./sections/AccordionCollapsibleDemo"));
const CarouselDemo = React.lazy(() => import("./sections/CarouselDemo"));
const AlertDialogStandalone = React.lazy(() => import("./sections/AlertDialogStandalone"));
const CatalogoDemo = React.lazy(() => import("./sections/CatalogoDemo"));
const ComboboxDemo = React.lazy(() => import("./sections/ComboboxDemo"));
const ClickableDemo = React.lazy(() => import("./sections/ClickableDemo"));
const CommandDemo = React.lazy(() => import("./sections/CommandDemo"));
const ComponentsSampler = React.lazy(() => import("./sections/ComponentsSampler"));
const ContactForm = React.lazy(() => import("./sections/ContactForm"));
const DataTableDemo = React.lazy(() => import("./sections/DataTableDemo"));
const ColorPickerDemo = React.lazy(() => import("./sections/ColorPickerDemo"));
const DisplayDemo = React.lazy(() => import("./sections/DisplayDemo"));
const FormControlsExtraDemo = React.lazy(() => import("./sections/FormControlsExtraDemo"));
const DatePickersDemo = React.lazy(() => import("./sections/DatePickersDemo"));
const DialogsDemo = React.lazy(() => import("./sections/DialogsDemo"));
const FeedbackDemo = React.lazy(() => import("./sections/FeedbackDemo"));
const FieldDemo = React.lazy(() => import("./sections/FieldDemo"));
const AppShellDemo = React.lazy(() => import("./sections/AppShellDemo"));
const FormControlsDemo = React.lazy(() => import("./sections/FormControlsDemo"));
const TamanosDemo = React.lazy(() => import("./sections/TamanosDemo"));
const GruposDemo = React.lazy(() => import("./sections/GruposDemo"));
const HelloWorld = React.lazy(() => import("./sections/HelloWorld"));
const LoginCard = React.lazy(() => import("./sections/LoginCard"));
const ImageDemo = React.lazy(() => import("./sections/ImageDemo"));
const MediaCardDemo = React.lazy(() => import("./sections/MediaCardDemo"));
const MenusHoverDemo = React.lazy(() => import("./sections/MenusHoverDemo"));
const MenusSelectDemo = React.lazy(() => import("./sections/MenusSelectDemo"));
const PantallaInicio = React.lazy(() => import("./sections/pantallas/PantallaInicio"));
const PantallaListado = React.lazy(() => import("./sections/pantallas/PantallaListado"));
const PantallaFicha = React.lazy(() => import("./sections/pantallas/PantallaFicha"));
const PortalHeaderDemo = React.lazy(() => import("./sections/PortalHeaderDemo"));
const TemaPorSeccionDemo = React.lazy(() => import("./sections/TemaPorSeccionDemo"));
const PantallaRegistroUnico = React.lazy(
  () => import("./sections/pantallas/PantallaRegistroUnico"),
);
const PantallaAjustes = React.lazy(() => import("./sections/pantallas/PantallaAjustes"));
const PrimitivesDemo = React.lazy(() => import("./sections/PrimitivesDemo"));
const ProgressSkeletonDemo = React.lazy(() => import("./sections/ProgressSkeletonDemo"));
const ScrollToolbarDemo = React.lazy(() => import("./sections/ScrollToolbarDemo"));
const SectionDemo = React.lazy(() => import("./sections/SectionDemo"));
const TableDemo = React.lazy(() => import("./sections/TableDemo"));
const ToastDemo = React.lazy(() => import("./sections/ToastDemo"));
const VaciosDemo = React.lazy(() => import("./sections/VaciosDemo"));

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation("app");
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">{t("theme", { fallback: "Tema" })}</span>
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

const AppHeader = () => {
  const { t } = useTranslation("app");
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("title", { fallback: "Elise UI Showcase" })}
        </h1>
        <p className="text-muted-foreground">
          {t("subtitle", {
            fallback: "Ejemplos rapidos usando Radix + Tailwind con el design system.",
          })}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <LocaleToggle />
        <ThemeToggle />
      </div>
    </header>
  );
};

const SectionFallback = () => (
  <div className="min-h-[220px] w-full animate-pulse rounded-sm bg-muted" />
);

const LazySection = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense fallback={<SectionFallback />}>{children}</React.Suspense>
);

/* Las secciones que solo son título y demo. Las que llevan algo más (un `id`,
   una acción en la cabecera, un envoltorio) siguen escritas abajo. */
const SECCIONES: { title: string; Demo: React.ComponentType }[] = [
  { title: "Dialog & Alert Dialog", Demo: DialogsDemo },
  { title: "Alert Dialog (standalone)", Demo: AlertDialogStandalone },
  { title: "Accordion & Collapsible", Demo: AccordionCollapsibleDemo },
  { title: "Progress & Skeleton", Demo: ProgressSkeletonDemo },
  { title: "AppShell: marco de aplicacion", Demo: AppShellDemo },
  { title: "Clickable: la caja entera que se pulsa", Demo: ClickableDemo },
  { title: "Image y Thumbnail", Demo: ImageDemo },
  { title: "Section: el grupo con su rotulo", Demo: SectionDemo },
  { title: "CheckboxGroup, ButtonGroup y List", Demo: GruposDemo },
  { title: "Los dos vacios de un listado", Demo: VaciosDemo },
  { title: "Pantalla de inicio", Demo: PantallaInicio },
  { title: "Pantalla de listado", Demo: PantallaListado },
  { title: "Tema por seccion", Demo: TemaPorSeccionDemo },
  { title: "Portal: cabecera", Demo: PortalHeaderDemo },
  { title: "Pantalla de registro unico", Demo: PantallaRegistroUnico },
  { title: "Pantalla de ficha", Demo: PantallaFicha },
  { title: "Pantalla de ajustes", Demo: PantallaAjustes },
  { title: "Field: rotulo, error y accesibilidad enlazada", Demo: FieldDemo },
  { title: "MultiSelect, FileUpload y Stepper", Demo: CatalogoDemo },
  { title: "Combobox: select con busqueda", Demo: ComboboxDemo },
  { title: "Primitivas: Box, Stack, Grid, Bleed y Text", Demo: PrimitivesDemo },
  { title: "Badge, Alert, Spinner y Empty State", Demo: FeedbackDemo },
  { title: "Menubar, Context Menu y Select", Demo: MenusSelectDemo },
  { title: "Dropdown & Hover Card", Demo: MenusHoverDemo },
  { title: "La escala de los campos y los botones", Demo: TamanosDemo },
  { title: "Form controls (Radio, Switch, Slider)", Demo: FormControlsDemo },
  { title: "Media Card, Avatar y Aspect Ratio", Demo: MediaCardDemo },
  { title: "Command Palette", Demo: CommandDemo },
  { title: "Stat, AvatarGroup, DescriptionList, Timeline y Tree", Demo: DisplayDemo },
  { title: "Number, Search, Segmented, Tags, Rating y Time", Demo: FormControlsExtraDemo },
  { title: "Color Picker", Demo: ColorPickerDemo },
  { title: "Table", Demo: TableDemo },
  { title: "Data Table (filtros y exportacion)", Demo: DataTableDemo },
  { title: "Carousel", Demo: CarouselDemo },
  { title: "Scroll & Toolbar", Demo: ScrollToolbarDemo },
  { title: "Toast", Demo: ToastDemo },
];

const App = () => (
  <I18nProvider
    defaultLocale={i18nConfig.defaultLocale}
    fallbackLocale={i18nConfig.fallbackLocale}
    messages={messages}
  >
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-8 px-4 py-8">
        <AppHeader />

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

        <main className="flex flex-1 flex-col gap-8 pb-12">
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
                    <Button size="sm" variant="outline">
                      Ver en accion
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Simple demo de componentes basicos.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            }
          >
            <div className="relative flex min-h-[260px] items-center justify-center">
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
                  <Button size="sm" variant="outline">
                    Ver codigo
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 text-sm">
                  Usa inputs, textarea, checkbox y submit con estado local.
                </PopoverContent>
              </Popover>
            }
          >
            <div className="relative flex min-h-80 items-center justify-center">
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
                  <Button size="sm" variant="outline">
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
            <div className="relative flex min-h-80 justify-center">
              <LazySection>
                <ComponentsSampler />
              </LazySection>
            </div>
          </SectionCard>

          {SECCIONES.map(({ title, Demo }) => (
            <SectionCard key={title} title={title}>
              <LazySection>
                <Demo />
              </LazySection>
            </SectionCard>
          ))}
          <SectionCard id="login" title="Tarjeta de login simple.">
            <div className="relative flex min-h-[260px] items-center justify-center">
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
  </I18nProvider>
);

export default App;
