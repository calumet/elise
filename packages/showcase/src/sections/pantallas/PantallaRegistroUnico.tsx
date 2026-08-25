import { Bell, CircleHelp, Upload } from "@calumet/elise-icons";
import {
  AppShell,
  AppShellHeader,
  AppShellHeaderAction,
  AppShellHeaderActions,
  AppShellHeaderBrand,
  AppShellHeaderSearch,
  AppShellMain,
  AppShellUserMenu,
} from "@calumet/elise-ui/app-shell";
import { Badge } from "@calumet/elise-ui/badge";
import { Button } from "@calumet/elise-ui/button";
import { Code } from "@calumet/elise-ui/code";
import { Container } from "@calumet/elise-ui/container";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListTerm,
} from "@calumet/elise-ui/description-list";
import { DropdownMenuItem } from "@calumet/elise-ui/dropdown-menu";
import { Link } from "@calumet/elise-ui/link";
import { Section } from "@calumet/elise-ui/section";
import { Stepper, StepperItem, StepperTitle } from "@calumet/elise-ui/stepper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@calumet/elise-ui/table";
import { Tabs, TabsList, TabsTrigger } from "@calumet/elise-ui/tabs";
import { Text } from "@calumet/elise-ui/text";

const PENDIENTES = [
  { nombre: "Informe final", estado: "ENTREGA_FINAL_SUBIDA" },
  { nombre: "Formato de propiedad intelectual", estado: "ENTREGA_FINAL_SUBIDA" },
];

/**
 * Pantalla de registro único: la aplicación entera es un solo registro y no hay
 * listado al que volver.
 *
 * No lleva `AppShellNav`, y por eso tampoco `AppShellNavToggle`: lo que en otra
 * aplicación serían destinos de la barra acá son facetas del mismo registro, y
 * eso son pestañas. Sin navegación, la pista del marco colapsa a cero y el
 * contenido toma el ancho completo.
 */
const PantallaRegistroUnico = (): React.JSX.Element => (
  <div className="h-[820px] w-full overflow-hidden rounded-xl border border-border">
    <AppShell className="h-full">
      <AppShellHeader>
        <AppShellHeaderBrand>
          <Text size="lg" weight="bold">
            Calumet
          </Text>
        </AppShellHeaderBrand>
        <AppShellHeaderSearch shortcut={["Ctrl", "K"]} onClick={() => {}}>
          Buscar
        </AppShellHeaderSearch>
        <AppShellHeaderActions>
          <AppShellHeaderAction label="Notificaciones" icon={<Bell />} />
          <AppShellHeaderAction label="Ayuda" icon={<CircleHelp />} />
          <AppShellUserMenu name="Laura R." detail="Ingeniería de Sistemas" initials="LR">
            <DropdownMenuItem>Mi perfil</DropdownMenuItem>
            <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
          </AppShellUserMenu>
        </AppShellHeaderActions>
      </AppShellHeader>

      <AppShellMain>
        <Container size="lg" gutter={false} className="flex flex-col gap-5">
          <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="flex min-w-0 flex-col gap-1">
              <Text as="h2" size="xl" weight="semibold">
                Aprendizaje federado para detectar anomalías en la red de sensores del campus
              </Text>
              <div className="flex flex-wrap items-center gap-2">
                <Code>TG-01K2QY7M3ZB4</Code>
                <Text size="sm" tone="muted">
                  Ingeniería de Sistemas · 2026-II
                </Text>
              </div>
            </div>
            <Badge>En desarrollo</Badge>
          </header>

          <Tabs defaultValue="resumen">
            <TabsList>
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="requisitos" className="gap-2">
                Requisitos
                <Badge tone="warning">2</Badge>
              </TabsTrigger>
              <TabsTrigger value="solicitudes">Solicitudes</TabsTrigger>
              <TabsTrigger value="actas">Actas y decisiones</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            <div className="flex min-w-0 flex-col gap-5">
              <Section heading="Dónde va el proceso">
                <div className="flex flex-col gap-3">
                  <Stepper className="max-w-xl">
                    <StepperItem status="complete">
                      <StepperTitle>Propuesta</StepperTitle>
                    </StepperItem>
                    <StepperItem status="current">
                      <StepperTitle>Desarrollo</StepperTitle>
                    </StepperItem>
                    <StepperItem status="upcoming" last>
                      <StepperTitle>Sustentación</StepperTitle>
                    </StepperItem>
                  </Stepper>
                  <Text size="sm" tone="muted">
                    La propuesta se aprobó en el acta 07 del Comité Metodológico. El siguiente acto
                    formal es la entrega final.
                  </Text>
                </div>
              </Section>

              <Section heading="Lo que sigue">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <Text weight="semibold">Subir la entrega final</Text>
                    <Text size="sm" tone="muted">
                      Le faltan dos requisitos. El plazo del calendario de la escuela vence el 18 de
                      septiembre de 2026.
                    </Text>
                  </div>
                  {/* Apagado con el motivo al lado, y no un enlace a la lista completa:
                      la tarjeta de acción tiene que llevar la acción. */}
                  <Button disabled>
                    <Upload aria-hidden />
                    Subir entrega
                  </Button>
                </div>
              </Section>

              {/* Solo los pendientes. Los satisfechos ya no van a cambiar y viven en
                  su pestaña, así que en el resumen ocupan sitio sin decir nada. */}
              <Section heading="Lo que falta para la entrega final">
                <Table bare frameClassName="overflow-hidden rounded-lg border border-border">
                  <TableHeader>
                    <TableRow>
                      <TableHead listSlot="primary">Requisito</TableHead>
                      <TableHead>Se exige para</TableHead>
                      <TableHead listSlot="secondary">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PENDIENTES.map((f) => (
                      <TableRow key={f.nombre}>
                        <TableCell>{f.nombre}</TableCell>
                        <TableCell>
                          <Code>{f.estado}</Code>
                        </TableCell>
                        <TableCell>
                          <Badge tone="warning">Pendiente</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Section>
            </div>

            <aside aria-label="Datos del trabajo de grado" className="flex min-w-0 flex-col gap-5">
              <Section heading="Quiénes participan">
                <DescriptionList>
                  <DescriptionListTerm>Autores</DescriptionListTerm>
                  <DescriptionListDescription>
                    Laura Melisa Rangel Ortiz · Andrés Felipe Cárdenas Peña
                  </DescriptionListDescription>
                  <DescriptionListTerm>Director</DescriptionListTerm>
                  <DescriptionListDescription>Marta Lucía Vergara Sáenz</DescriptionListDescription>
                  <DescriptionListTerm>Codirector</DescriptionListTerm>
                  <DescriptionListDescription>
                    Julián Andrés Bohórquez (Ingeniería Eléctrica, UIS)
                  </DescriptionListDescription>
                  <DescriptionListTerm>Jurados</DescriptionListTerm>
                  <DescriptionListDescription>
                    Se designan al aprobar la entrega final
                  </DescriptionListDescription>
                </DescriptionList>
              </Section>

              <Section heading="Última decisión">
                <div className="flex flex-col gap-2">
                  <Text size="sm" weight="semibold">
                    Acta 07 de 2026-I — Comité Metodológico
                  </Text>
                  <Text size="sm" tone="muted">
                    21 de mayo de 2026. La propuesta quedó aprobada y el proyecto pasó a desarrollo.
                  </Text>
                  <div>
                    <Link href="#pantallas">Ver el acta</Link>
                  </div>
                </div>
              </Section>
            </aside>
          </div>
        </Container>
      </AppShellMain>
    </AppShell>
  </div>
);

export default PantallaRegistroUnico;
