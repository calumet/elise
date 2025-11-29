import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  ThemeProvider,
  useTheme,
} from '@elise/ui';
import { Toaster } from '@elise/utils/toasts';

import './index.css';
import HelloWorld from './sections/HelloWorld';
import ContactForm from './sections/ContactForm';
import ComponentsSampler from './sections/ComponentsSampler';
import LoginCard from './sections/LoginCard';
import DialogsDemo from './sections/DialogsDemo';
import AccordionCollapsibleDemo from './sections/AccordionCollapsibleDemo';
import ProgressSkeletonDemo from './sections/ProgressSkeletonDemo';
import ToastDemo from './sections/ToastDemo';
import MenusSelectDemo from './sections/MenusSelectDemo';
import { SectionCard } from './components/SectionCard';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-mutedForeground">Tema</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="px-3"
      >
        {theme === 'dark' ? 'Light' : 'Dark'}
      </Button>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="max-w-4xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Elise UI Showcase</h1>
            <p className="text-mutedForeground">Ejemplos rapidos usando Radix + Tailwind con el design system.</p>
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
                      <p className="text-xs text-mutedForeground">Primer componente de ejemplo.</p>
                    </a>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <a href="#contact">
                      <h3 className="text-sm font-semibold">Contacto</h3>
                      <p className="text-xs text-mutedForeground">Formulario con inputs y text area.</p>
                    </a>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <a href="#components">
                      <h3 className="text-sm font-semibold">Sampler</h3>
                      <p className="text-xs text-mutedForeground">Tabs, popover, progress y mas.</p>
                    </a>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <a href="#login">
                      <h3 className="text-sm font-semibold">Login Card</h3>
                      <p className="text-xs text-mutedForeground">Ejemplo de tarjeta simple.</p>
                    </a>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuIndicator />
        </NavigationMenu>

        <main className="flex flex-col flex-1 gap-8 pb-12">
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
              <HelloWorld />
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
            <div className="flex items-center justify-center min-h-[320px] relative">
              <ContactForm />
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
                  <p className="text-sm text-mutedForeground">Usa Radix Dialog con estilos base del preset.</p>
                </DialogContent>
              </Dialog>
            }
          >
            <div className="flex justify-center min-h-[320px] relative">
              <ComponentsSampler />
            </div>
          </SectionCard>

          <SectionCard title="Dialog & Alert Dialog">
            <DialogsDemo />
          </SectionCard>

          <SectionCard title="Accordion & Collapsible">
            <AccordionCollapsibleDemo />
          </SectionCard>

          <SectionCard title="Progress & Skeleton">
            <ProgressSkeletonDemo />
          </SectionCard>

          <SectionCard title="Menubar, Context Menu y Select">
            <MenusSelectDemo />
          </SectionCard>

          <SectionCard title="Toast">
            <ToastDemo />
          </SectionCard>

          <SectionCard id="login" title="Tarjeta de login simple.">
            <div className="flex items-center justify-center min-h-[260px] relative">
              <LoginCard />
            </div>
          </SectionCard>
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>
);

