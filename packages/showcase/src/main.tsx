import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  Input,
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
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  ThemeProvider,
  useTheme,
  Textarea
} from '@elise/ui';

import './index.css';
import HelloWorld from './sections/HelloWorld';
import ContactForm from './sections/ContactForm';
import ComponentsSampler from './sections/ComponentsSampler';
import LoginCard from './sections/LoginCard';

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
            <p className="text-mutedForeground">
              Ejemplos rápidos usando Radix + Tailwind con el design system.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <NavigationMenu className="justify-start">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Explorar</NavigationMenuTrigger>
              <NavigationMenuContent className="p-3">
                <div className="grid gap-3 sm:w-[300px]">
                  <NavigationMenuLink asChild>
                    <a className="block rounded-lg border border-border bg-surface p-3 hover:bg-muted transition" href="#hello">
                      <h3 className="text-sm font-semibold">Hello World</h3>
                      <p className="text-xs text-mutedForeground">Primer componente de ejemplo.</p>
                    </a>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <a className="block rounded-lg border border-border bg-surface p-3 hover:bg-muted transition" href="#contact">
                      <h3 className="text-sm font-semibold">Contacto</h3>
                      <p className="text-xs text-mutedForeground">Formulario con inputs y text area.</p>
                    </a>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <a className="block rounded-lg border border-border bg-surface p-3 hover:bg-muted transition" href="#components">
                      <h3 className="text-sm font-semibold">Sampler</h3>
                      <p className="text-xs text-mutedForeground">Tabs, popover, progress y más.</p>
                    </a>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <a className="block rounded-lg border border-border bg-surface p-3 hover:bg-muted transition" href="#login">
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
          <section id="hello" className="flex flex-col gap-4 border rounded-lg p-4 min-h-[320px] relative">
            <div className="flex items-center justify-between">
              <h2 className="text-sm text-mutedForeground sm:pl-3">Hello world rápido con botones y tooltip.</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline">
                      Ver en acción
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Simple demo de componentes básicos.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center justify-center min-h-[260px] relative">
              <HelloWorld />
            </div>
          </section>

          <section id="contact" className="flex flex-col gap-4 border rounded-lg p-4 min-h-[380px] relative">
            <div className="flex items-center justify-between">
              <h2 className="text-sm text-mutedForeground sm:pl-3">
                Formulario de contacto con validación mínima.
              </h2>
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline">
                    Ver código
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 text-sm">
                  Usa inputs, textarea, checkbox y submit con estado local.
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center justify-center min-h-[320px] relative">
              <ContactForm />
            </div>
          </section>

          <section id="components" className="flex flex-col gap-4 border rounded-lg p-4 min-h-[380px] relative">
            <div className="flex items-center justify-between">
              <h2 className="text-sm text-mutedForeground sm:pl-3">
                Component sampler: Tabs, Progress, Dialog, Toast-like.
              </h2>
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
                  <p className="text-sm text-mutedForeground">
                    Usa Radix Dialog con estilos base del preset.
                  </p>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex items-center justify-center min-h-[320px] relative">
              <ComponentsSampler />
            </div>
          </section>

          <section id="login" className="flex flex-col gap-4 border rounded-lg p-4 min-h-[320px] relative">
            <div className="flex items-center justify-between">
              <h2 className="text-sm text-mutedForeground sm:pl-3">Tarjeta de login simple.</h2>
            </div>
            <div className="flex items-center justify-center min-h-[260px] relative">
              <LoginCard />
            </div>
          </section>
        </main>
      </div>
    </ThemeProvider>
  </React.StrictMode>
);
