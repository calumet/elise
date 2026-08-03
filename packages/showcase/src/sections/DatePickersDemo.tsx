import { DateField } from "@calumet/elise-ui/date-field";
import { DatePicker, DateRangePicker } from "@calumet/elise-ui/date-picker";
import { useState } from "react";

const DatePickersDemo = () => {
  const [single, setSingle] = useState<Date | undefined>(new Date());
  const [range, setRange] = useState<{ from: Date | undefined; to?: Date }>({
    from: new Date(),
    to: new Date(),
  });

  const [entrega, setEntrega] = useState("2026-08-14");
  const [errorEntrega, setErrorEntrega] = useState<string | undefined>();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <p className="text-base font-semibold text-foreground">Date Picker</p>
        <DatePicker value={single} onChange={setSingle} />
      </div>
      <div className="space-y-2">
        <p className="text-base font-semibold text-foreground">Date Range Picker</p>
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <p className="text-base font-semibold text-foreground">Date Field</p>
        <div className="max-w-sm">
          <DateField
            label="Fecha de entrega"
            description="Se puede escribir o elegir en el calendario."
            error={errorEntrega}
            required
            min="2026-08-01"
            value={entrega}
            onValueChange={(v) => {
              setEntrega(v);
              setErrorEntrega(undefined);
            }}
            onInvalid={(crudo) => setErrorEntrega(`«${crudo}» no es una fecha admitida.`)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Escribe <code className="font-mono">2026-02-31</code> y sal del campo: no se avisa
          mientras tecleas, porque una fecha a medio escribir pasa por todos los estados inválidos.
        </p>
      </div>
    </div>
  );
};

export default DatePickersDemo;
