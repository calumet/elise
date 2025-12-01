import { useMemo } from 'react';
import { DataTable, type ColumnDef } from '@elise/utils/tables';

type Project = {
  name: string;
  status: 'Stable' | 'Alpha' | 'Draft';
  owner: string;
  category: string;
};

const rows: Project[] = [
  { name: 'Elise UI', status: 'Stable', owner: 'Equipo Core', category: 'Frontend' },
  { name: 'Showcase', status: 'Draft', owner: 'Equipo DX', category: 'Frontend' },
  { name: 'Utils', status: 'Alpha', owner: 'Equipo Core', category: 'Shared' },
  { name: 'Blocks', status: 'Draft', owner: 'Equipo DX', category: 'Shared' },
  { name: 'Infra', status: 'Stable', owner: 'Equipo SRE', category: 'Plataforma' },
  { name: 'Docs', status: 'Stable', owner: 'Equipo DX', category: 'Frontend' },
  { name: 'CLI Tools', status: 'Alpha', owner: 'Equipo Core', category: 'Tooling' },
  { name: 'Design Tokens', status: 'Stable', owner: 'Equipo Core', category: 'Shared' },
  { name: 'Auth Service', status: 'Alpha', owner: 'Equipo Backend', category: 'Backend' },
  { name: 'Payments', status: 'Draft', owner: 'Equipo Backend', category: 'Backend' },
  { name: 'Analytics', status: 'Draft', owner: 'Equipo Data', category: 'Data' },
  { name: 'Observability', status: 'Alpha', owner: 'Equipo SRE', category: 'Plataforma' },
  { name: 'Landing Page', status: 'Stable', owner: 'Marketing', category: 'Frontend' },
  { name: 'Emails', status: 'Alpha', owner: 'Marketing', category: 'Backend' },
  { name: 'Notifications', status: 'Draft', owner: 'Equipo Core', category: 'Shared' }
];

const DataTableDemo = () => {
  const columns: ColumnDef<Project>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Proyecto',
        meta: { filterVariant: 'text' }
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        meta: { filterVariant: 'select' },
        cell: ({ getValue }) => {
          const value = getValue<Project['status']>();
          const toneClass =
            value === 'Stable'
              ? 'bg-success/15 text-success border-success/30'
              : value === 'Draft'
                ? 'bg-warning/15 text-warning border-warning/30'
                : 'bg-danger/15 text-danger border-danger/30';
          return (
            <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold ${toneClass}`}>
              {value}
            </span>
          );
        }
      },
      {
        accessorKey: 'owner',
        header: 'Responsable',
        meta: { filterVariant: 'text' }
      },
      {
        accessorKey: 'category',
        header: 'Categoría',
        meta: { filterVariant: 'select' }
      }
    ],
    []
  );

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Tabla con filtros rápidos y exportación.</p>
      <DataTable name="proyectos" columns={columns} data={rows} initialPageSize={5} exportTo />
    </div>
  );
};

export default DataTableDemo;
