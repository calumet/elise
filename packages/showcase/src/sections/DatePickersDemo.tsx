import { useState } from 'react';
import { DatePicker, DateRangePicker } from '@elise/ui/date-picker';
import { formatDate, formatDateRange } from '@elise/utils/dates';

const DatePickersDemo = () => {
  const [single, setSingle] = useState<Date | undefined>(new Date());
  const [range, setRange] = useState<{ from: Date | undefined; to?: Date }>({
    from: new Date(),
    to: new Date()
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <p className="text-base font-semibold text-foreground">Date Picker</p>
        <DatePicker
          value={single}
          onChange={setSingle}
          formatLabel={(d?: Date) => (d ? formatDate(d) : 'Selecciona una fecha')}
        />
      </div>
      <div className="space-y-2">
        <p className="text-base font-semibold text-foreground">Date Range Picker</p>
        <DateRangePicker
          value={range}
          onChange={setRange}
          formatLabel={(r) =>
            r?.from && r?.to ? formatDateRange({ from: r.from, to: r.to }) : 'Selecciona un rango'
          }
        />
      </div>
    </div>
  );
};

export default DatePickersDemo;
