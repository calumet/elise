import { useState } from 'react';
import { DatePicker, DateRangePicker } from '@elise/ui';
import { formatDate, formatDateRange } from '@elise/utils/dates';

const DatePickersDemo = () => {
  const [single, setSingle] = useState<Date | undefined>(new Date());
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(),
    to: new Date()
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Date Picker</p>
        <DatePicker value={single} onChange={setSingle} formatLabel={(d) => formatDate(d)} />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Date Range Picker</p>
        <DateRangePicker value={range} onChange={setRange} formatLabel={(r) => formatDateRange(r)} />
      </div>
    </div>
  );
};

export default DatePickersDemo;
