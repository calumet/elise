import { ReactNode } from 'react';

type SectionCardProps = {
  id?: string;
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export const SectionCard = ({ id, title, action, children, className }: SectionCardProps) => {
  return (
    <section
      id={id}
      className={`flex flex-col gap-4 rounded-sm border border-border p-4 shadow-sm ${className ?? ''}`}
    >
      {title ? (
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm text-mutedForeground font-semibold sm:pl-1">{title}</h2>
          <div className="w-max">
            {action}
          </div>
        </div>
      ) : null}
      <div className="flex-1">{children}</div>
    </section>
  );
};
